import type { VercelRequest, VercelResponse } from "@vercel/node";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/lib/firebase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const giftsSnap = await getDocs(collection(db, "gift_history"));
    const list: any[] = [];
    giftsSnap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return res.status(200).json({ success: true, giftHistory: list });
  } catch (err: any) {
    console.error("Error fetching gift history:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_SERVER_ERROR", message: err.message || "Server error" });
  }
}
