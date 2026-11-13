const supabase = require("../lib/supabase");

// [과제 1] 공연 목록 조회
async function getPerformances(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("performances")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return res.json(data ?? []);
  } catch (error) {
    next(error);
  }
}

// [과제 2] 공연 등록
async function createPerformance(req, res, next) {
  try {
    const { title, venue, starts_at, price } = req.body || {};

    if (!title || !venue || !starts_at || price === undefined) {
      return res
        .status(400)
        .json({
          error: "title, venue, starts_at, price를 모두 입력해 주세요.",
        });
    }

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof venue !== "string" ||
      venue.trim() === ""
    ) {
      return res
        .status(400)
        .json({ error: "title, venue는 빈 문자열일 수 없습니다." });
    }

    const parsedDate = new Date(starts_at);
    if (Number.isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ error: "starts_at 형식이 올바르지 않습니다." });
    }

    const numericPrice = Number(price);
    if (!Number.isInteger(numericPrice) || numericPrice < 0) {
      return res
        .status(400)
        .json({ error: "price는 0 이상의 정수여야 합니다." });
    }

    const { data, error } = await supabase
      .from("performances")
      .insert({ title, venue, starts_at, price: numericPrice })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "공연 등록 완료",
      performance: data,
    });
  } catch (error) {
    next(error);
  }
}

// [과제 3] 공연 수정
async function updatePerformance(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: "공연 ID가 올바르지 않습니다." });
    }

    const body = req.body || {};
    const allowedFields = ["title", "venue", "starts_at", "price"];
    const updates = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "수정할 내용이 없습니다." });
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || updates.title.trim() === "")
    ) {
      return res.status(400).json({ error: "title이 올바르지 않습니다." });
    }
    if (
      updates.venue !== undefined &&
      (typeof updates.venue !== "string" || updates.venue.trim() === "")
    ) {
      return res.status(400).json({ error: "venue가 올바르지 않습니다." });
    }
    if (updates.starts_at !== undefined) {
      const parsedDate = new Date(updates.starts_at);
      if (Number.isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json({ error: "starts_at 형식이 올바르지 않습니다." });
      }
    }
    if (updates.price !== undefined) {
      const numericPrice = Number(updates.price);
      if (!Number.isInteger(numericPrice) || numericPrice < 0) {
        return res
          .status(400)
          .json({ error: "price는 0 이상의 정수여야 합니다." });
      }
      updates.price = numericPrice;
    }

    const { data, error } = await supabase
      .from("performances")
      .update(updates)
      .eq("id", numericId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "해당 공연을 찾을 수 없습니다." });
    }

    return res.json({
      message: "공연 수정 완료",
      performance: data,
    });
  } catch (error) {
    next(error);
  }
}

// [과제 4] 공연 삭제
async function deletePerformance(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: "공연 ID가 올바르지 않습니다." });
    }

    const { data, error } = await supabase
      .from("performances")
      .delete()
      .eq("id", numericId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "해당 공연을 찾을 수 없습니다." });
    }

    return res.json({ message: "공연 삭제 완료" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPerformances,
  createPerformance,
  updatePerformance,
  deletePerformance,
};
