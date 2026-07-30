"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { db } from '../firebase'; 

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [fetchTrigger, setFetchTrigger] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  
  // 🚨 [고도화 포인트 1] 검색어 상태 관리용 State 추가
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: ''
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data() }));
        setProducts(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchProducts();
  }, [isAuthenticated, fetchTrigger]); 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@11223344@') { 
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeId = formData.id.trim();
      const dataToSave = { ...formData, id: safeId };

      await setDoc(doc(db, "products", safeId), dataToSave);
      alert(`🎉 [${dataToSave.name}] 상품 정보가 저장되었습니다!`);
      
      setFormData({ id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: '' });
      setIsEditing(false); 
      setFetchTrigger(!fetchTrigger); 
    } catch (error) {
      console.error("등록 에러:", error);
      alert('상품 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirm = window.confirm(`정말 [${name}] 상품을 삭제하시겠습니까?`);
    if (isConfirm) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert('삭제가 완료되었습니다.');
        setFetchTrigger(!fetchTrigger); 
      } catch (error) {
        console.error("삭제 에러:", error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (product: any) => {
    setFormData(product);
    setIsEditing(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (e.target.name === 'id') {
      value = value.replace(/\s/g, ''); 
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const fillTestData = () => {
    setFormData({
      id: 'temu_test_01',
      name: '[미친 수압] 호텔식 샤워기 헤드',
      category: '욕실용품',
      price: '4,500원',
      originalPrice: '18,000원',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      affiliateLink: 'https://temu.to/m/example'
    });
  };

  const handleCopyLink = (id: string) => {
    const fullUrl = `https://enjoy-2e.vercel.app/?id=${id}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`🔗 SNS 공유 링크가 복사되었습니다!\n\n${fullUrl}\n\n이제 인스타/틱톡에 바로 붙여넣기 하세요!`);
    }).catch(err => {
      console.error("복사 실패:", err);
      alert("링크 복사에 실패했습니다.");
    });
  };

  // 🚨 [고도화 포인트 2 - 무적 방패 적용] 불량 데이터가 있어도 절대 에러 나지 않음!
  const filteredProducts = products.filter(product => {
    const safeName = product.name || "";
    const safeId = product.id || "";
    return safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           safeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 px-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm">
          <div className="flex justify-center mb-4"><span className="text-4xl">🔐</span></div>
          <h2 className="text-xl font-bold mb-6 text-center text-white">관리자 시스템</h2>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력" 
            className="w-full bg-slate-900 border border-slate-600 p-3 mb-6 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          />
          <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition">
            접속하기
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-900 p-6 font-sans text-slate-100">
      
      <div className="border-b border-slate-700 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> 상품 등록 및 수정
          </h1>
        </div>
        <button 
          type="button" onClick={fillTestData}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded border border-slate-600 transition"
        >
          마법의 자동입력 🪄
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">
            고유 ID <span className="font-normal text-slate-500">(미리보기: https://enjoy-2e.vercel.app/?id=<span className="text-orange-400 font-bold">{formData.id || '...'}</span>)</span>
          </label>
          <input 
            required 
            type="text" 
            name="id" 
            value={formData.id} 
            onChange={handleChange} 
            readOnly={isEditing}
            className={`w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none placeholder-slate-600 ${
              isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-orange-500'
            }`}
            placeholder="예: temu_001"/>
            {isEditing && (
              <p className="text-xs text-orange-400 mt-1 font-bold">
                ※ 수정 중에는 고유 ID를 변경할 수 없습니다.
              </p>
            )}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">상품명</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} 
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"
            placeholder="예: [품절대란] 1초 완성 야채 다지기"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">카테고리</label>
          <input required type="text" name="category" value={formData.category} onChange={handleChange} 
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"
            placeholder="예: 주방용품"/>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">할인가</label>
            <input required type="text" name="price" value={formData.price} onChange={handleChange} 
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"
              placeholder="예: 3,500원"/>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">원가</label>
            <input required type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} 
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"
              placeholder="예: 15,000원"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">이미지 주소 (URL)</label>
          <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} 
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">나만의 수익 링크 (어필리에이트)</label>
          <input required type="url" name="affiliateLink" value={formData.affiliateLink} onChange={handleChange} 
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"/>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl mt-2 shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">
          파이어베이스에 저장 🚀
        </button>
      </form>

      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📦</span> 등록된 상품 관리
        </h2>
        <p className="text-slate-400 text-sm mt-1">총 {products.length}개의 상품이 등록되어 있습니다.</p>
      </div>

      {/* 🚨 [고도화 포인트 3] 검색창 UI 구현 */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="🔍 상품명 또는 고유 ID를 입력해 바로 찾으세요..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-orange-500 focus:outline-none placeholder-slate-500 shadow-sm transition-all"
        />
      </div>

      <div className="flex flex-col gap-3 mb-12">
        {/* 🚨 원본 products 대신 필터링된 filteredProducts를 화면에 뿌려줍니다 */}
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-slate-500 transition-colors">
            <div className="flex items-center gap-4 overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-700" />
              <div className="flex flex-col">
                <span className="text-xs text-orange-400 font-bold mb-1">{product.id}</span>
                <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
              </div>
            </div>
            
            <div className="flex gap-2 min-w-max ml-2">
              <button 
                onClick={() => handleCopyLink(product.id)} 
                className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition border border-blue-600/30 font-bold flex items-center gap-1"
                title="이 상품의 접속 주소를 복사합니다"
              >
                <span>🔗</span> 복사
              </button>
              <button 
                onClick={() => handleEdit(product)} 
                className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition"
              >
                수정
              </button>
              <button 
                onClick={() => handleDelete(product.id, product.name)} 
                className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {/* 🚨 검색 결과가 없거나 등록된 상품이 없을 때 안내 문구 */}
        {filteredProducts.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-xl border border-slate-700">
            {searchTerm ? '검색어와 일치하는 상품이 없습니다. 🥲' : '등록된 상품이 없습니다.'}
          </div>
        )}
      </div>

      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📈</span> 실시간 페이지 조회수
        </h2>
        <p className="text-slate-400 text-sm mt-1">어떤 숏폼 제품이 가장 인기 있는지 확인하세요.</p>
      </div>

      <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex justify-center p-2 h-[500px]">
        <iframe 
          width="100%" 
          height="100%" 
          src="https://datastudio.google.com/embed/reporting/1ffab37c-8dc8-4ab3-a2f1-2618111c55ca/page/ky30F" 
          frameBorder={0} 
          style={{ border: 0 }} 
          allowFullScreen 
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

    </div>
  );
}