"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { db, auth } from '../firebase'; 

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [user, setUser] = useState<any>(null); 

  const [products, setProducts] = useState<any[]>([]);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [lastId, setLastId] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data() }));
        
        // 🚨 [핵심 고도화] updatedAt(수정 시간) 기준으로 최신순(내림차순) 정렬!
        // 옛날 데이터(updatedAt이 없는 경우)는 0으로 처리해 아래로 내립니다.
        data.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        setProducts(data);

        // 숫자 ID 추출 로직 (가장 큰 ID 찾기)
        if (data.length > 0) {
          const maxId = Math.max(...data.map(p => {
            const numOnly = String(p.id).replace(/[^0-9]/g, '');
            return numOnly ? Number(numOnly) : 0;
          }));
          setLastId(maxId);
        } else {
          setLastId(0);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchProducts();
  }, [user, fetchTrigger]); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('이메일이나 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (newPassword.length < 6) {
      alert("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("비밀번호가 성공적으로 변경되었습니다!");
      setNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("보안을 위해 로그아웃 후 다시 로그인한 직후에만 변경할 수 있습니다.");
      } else {
        alert("비밀번호 변경에 실패했습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeId = formData.id.trim();
      
      // 🚨 [핵심 고도화] 상품을 저장/수정할 때 '현재 시간(Date.now())'을 도장 찍어줍니다!
      const dataToSave = { 
        ...formData, 
        id: safeId,
        updatedAt: Date.now() 
      };
      
      await setDoc(doc(db, "products", safeId), dataToSave);
      alert(`🎉 [${dataToSave.name}] 상품 정보가 저장/수정되었습니다!`);
      
      setFormData({ id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: '' });
      setIsEditing(false); 
      setFetchTrigger(!fetchTrigger); 
    } catch (error) {
      alert('상품 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`정말 [${name}] 상품을 삭제하시겠습니까?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert('삭제가 완료되었습니다.');
        setFetchTrigger(!fetchTrigger); 
      } catch (error) {
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
    if (e.target.name === 'id') value = value.replace(/\s/g, ''); 
    setFormData({ ...formData, [e.target.name]: value });
  };

  const fillTestData = () => {
    setFormData({
      id: `temu_${String(lastId + 1).padStart(3, '0')}`, 
      name: '[미친 수압] 호텔식 샤워기 헤드', category: '욕실용품',
      price: '4,500원', originalPrice: '18,000원',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      affiliateLink: 'https://temu.to/m/example'
    });
  };

  const handleCopyLink = (id: string) => {
    const fullUrl = `https://enjoy-2e.vercel.app/?id=${id}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`🔗 SNS 공유 링크가 복사되었습니다!\n\n${fullUrl}`);
    }).catch(() => alert("링크 복사에 실패했습니다."));
  };

  const filteredProducts = products.filter(product => {
    const safeName = product.name || "";
    const safeId = product.id || "";
    return safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           safeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 px-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm">
          <div className="flex justify-center mb-4"><span className="text-4xl">🔐</span></div>
          <h2 className="text-xl font-bold mb-2 text-center text-white">관리자 시스템</h2>
          <p className="text-xs text-slate-400 text-center mb-6">부여받은 이메일 계정으로 로그인하세요.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 주소" className="w-full bg-slate-900 border border-slate-600 p-3 mb-4 rounded-lg text-white focus:border-orange-500 focus:outline-none" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="w-full bg-slate-900 border border-slate-600 p-3 mb-6 rounded-lg text-white focus:border-orange-500 focus:outline-none" />
          <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition">접속하기</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-900 p-6 font-sans text-slate-100">
      
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 text-blue-400 p-2 rounded-full">👤</div>
          <div>
            <p className="text-xs text-slate-400 font-bold">접속 계정</p>
            <p className="text-sm text-white font-bold">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition font-bold">로그아웃</button>
      </div>

      <div className="border-b border-slate-700 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> 상품 등록 및 수정
          </h1>
        </div>
        <button type="button" onClick={fillTestData} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded border border-slate-600 transition">
          마법의 자동입력 🪄
        </button>
      </div>
      
      <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 mb-6 flex items-center gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <p className="text-xs text-blue-300 mb-1">최근 등록된 숫자 ID: <span className="font-bold text-white text-sm">{lastId}</span></p>
          <p className="text-sm text-blue-200 font-bold">➡️ 다음 권장 입력 ID: <span className="text-orange-400 text-lg ml-1">{lastId + 1}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">고유 ID</label>
          <input required type="text" name="id" value={formData.id} onChange={handleChange} readOnly={isEditing} className={`w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none placeholder-slate-600 ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-orange-500'}`} placeholder={`권장: temu_${String(lastId + 1).padStart(3, '0')} 또는 ${lastId + 1}`}/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">상품명</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600" placeholder="예: [품절대란] 1초 완성 야채 다지기"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">카테고리</label>
          <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600" placeholder="예: 주방용품"/>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">할인가</label>
            <input required type="text" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600" placeholder="예: 3,500원"/>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">원가</label>
            <input required type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600" placeholder="예: 15,000원"/>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">이미지 주소 (URL)</label>
          <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">나만의 수익 링크 (어필리에이트)</label>
          <input required type="url" name="affiliateLink" value={formData.affiliateLink} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none placeholder-slate-600"/>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl mt-2 shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">파이어베이스에 저장 🚀</button>
      </form>

      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>📦</span> 등록된 상품 관리</h2>
      </div>

      <div className="mb-6">
        <input type="text" placeholder="🔍 상품명 또는 번호로 바로 찾으세요!" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-orange-500 focus:outline-none placeholder-slate-500 shadow-sm transition-all"/>
      </div>

      <div className="flex flex-col gap-3 mb-12">
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
              <button onClick={() => handleCopyLink(product.id)} className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition border border-blue-600/30 font-bold flex items-center gap-1"><span>🔗</span> 복사</button>
              <button onClick={() => handleEdit(product)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition">수정</button>
              <button onClick={() => handleDelete(product.id, product.name)} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition">삭제</button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-xl border border-slate-700">
            {searchTerm ? '검색어와 일치하는 상품이 없습니다. 🥲' : '등록된 상품이 없습니다.'}
          </div>
        )}
      </div>

      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>📉</span> 실시간 페이지 조회수</h2>
      </div>

      <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex justify-center p-2 h-[500px] mb-12">
        <iframe width="100%" height="100%" src="https://datastudio.google.com/embed/reporting/1ffab37c-8dc8-4ab3-a2f1-2618111c55ca/page/ky30F" frameBorder={0} style={{ border: 0 }} allowFullScreen />
      </div>

      <div className="bg-slate-950 p-6 rounded-xl border border-red-500/30 shadow-lg">
        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4"><span>🔒</span> 계정 비밀번호 변경</h3>
        <p className="text-xs text-slate-400 mb-4">앱을 인계받으셨다면, 보안을 위해 가장 먼저 본인만 아는 비밀번호로 변경해 주세요.</p>
        <form onSubmit={handleChangePassword} className="flex gap-3">
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새로운 비밀번호 (6자리 이상)" className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-white focus:border-red-500 focus:outline-none text-sm"/>
          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition text-sm whitespace-nowrap">변경하기</button>
        </form>
      </div>

    </div>
  );
}