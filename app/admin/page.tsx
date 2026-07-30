"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: "", name: "", price: "", imageUrl: "", affiliateLink: "" });
  const [lastId, setLastId] = useState<number>(0);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    // 🚨 깐깐한 에러 해결: data 변수에 any[] (프리패스 마패)를 달아줍니다!
    const data: any[] = querySnapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
    
    data.sort((a, b) => Number(b.id) - Number(a.id));
    setProducts(data);

    if (data.length > 0) {
      const maxId = Math.max(...data.map(p => Number(p.id)));
      setLastId(maxId);
    } else {
      setLastId(0);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), formData);
      alert("상품 등록 완료!");
      setFormData({ id: "", name: "", price: "", imageUrl: "", affiliateLink: "" });
      fetchProducts();
    } catch (error) {
      alert("등록 실패: " + error);
    }
  };

  const handleDelete = async (firebaseId: string) => {
    if (window.confirm("정말 이 상품을 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "products", firebaseId));
      fetchProducts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 text-slate-800">
      <h1 className="text-3xl font-bold mb-8">🛠️ 시크릿 관리자 페이지 (고객 A)</h1>
      
      <div className="bg-blue-100 p-4 rounded-lg mb-6 text-blue-800 font-bold">
        💡 최근 등록한 상품 ID: {lastId} ➡️ <span className="text-red-500">다음 권장 ID: {lastId + 1}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-100 p-6 rounded-xl flex flex-col gap-4 mb-10">
        <input type="number" placeholder="상품 ID (숫자)" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="p-2 border rounded" required />
        <input type="text" placeholder="상품명" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-2 border rounded" required />
        <input type="text" placeholder="가격 (예: 12,900원)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="p-2 border rounded" required />
        <input type="url" placeholder="이미지 URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="p-2 border rounded" required />
        <input type="url" placeholder="어필리에이트 구매 링크" value={formData.affiliateLink} onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})} className="p-2 border rounded" required />
        <button type="submit" className="bg-black text-white p-3 rounded font-bold hover:bg-slate-800">상품 등록하기</button>
      </form>

      <h2 className="text-2xl font-bold mb-4">📦 등록된 상품 목록 (최신순)</h2>
      <ul className="flex flex-col gap-4">
        {products.map((p) => (
          <li key={p.firebaseId} className="bg-white border p-4 rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <span className="font-bold text-orange-500 mr-2">[ID: {p.id}]</span>
              <span className="font-bold">{p.name}</span> <span className="text-slate-500">({p.price})</span>
            </div>
            <button onClick={() => handleDelete(p.firebaseId)} className="bg-red-500 text-white px-4 py-2 rounded text-sm font-bold">삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}