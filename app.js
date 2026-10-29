const labels={업소용:'쇼핑몰 업소용',S:'쇼핑몰 S','톰슨몰+거래처':'톰슨몰+거래처',픽업:'픽업',냉장:'냉장'};
const emptyData=()=>({업소용:[],S:[],'톰슨몰+거래처':[],픽업:[],냉장:[]});
const $=selector=>document.querySelector(selector);
const date=new Date();
const workDate=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const cacheKey=`thomson-shipping-${workDate}`;
let data=loadCache(),active='업소용',currentUser=null,products=[],productMatches=[],activeProductIndex=-1,selectedProduct=null;
const form=$('#entryForm'),list=$('#itemList'),empty=$('#emptyState');
const productInput=$('#productInput'),productSuggestions=$('#productSuggestions'),productHelp=$('#productHelp');
const cloud=window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
const shipping=cloud.schema('shipping');

function loadCache(){try{return {...emptyData(),...JSON.parse(localStorage.getItem(cacheKey))}}catch{return emptyData()}}
function cache(){localStorage.setItem(cacheKey,JSON.stringify(data))}
const normalizeName=name=>name.trim().replace(/\s+/g,' ').toLocaleLowerCase('ko-KR');
const choseongLetters='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function getChoseong(text){return [...text].map(character=>{const code=character.charCodeAt(0);return code>=0xac00&&code<=0xd7a3?choseongLetters[Math.floor((code-0xac00)/588)]:character}).join('')}
function productSearchValue(value){return normalizeName(value).replace(/\s/g,'')}
function findProducts(query){
  const needle=productSearchValue(query);
  if(!needle)return products.slice(0,8);
  const score=product=>{const name=productSearchValue(product.name),initials=productSearchValue(getChoseong(product.name));if(name.startsWith(needle))return 0;if(initials.startsWith(needle))return 1;if(name.includes(needle))return 2;if(initials.includes(needle))return 3;return 99};
  return products.map(product=>({product,score:score(product)})).filter(result=>result.score<99).sort((a,b)=>a.score-b.score||a.product.display_order-b.product.display_order).slice(0,8).map(result=>result.product);
}
const totals=()=>Object.values(data).flat().reduce((sum,item)=>sum+item.qty,0);
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400)}
function setSync(text,state=''){const el=$('#syncStatus');el.textContent=text;el.className=`sync-status ${state}`}

function hideProductSuggestions(){productSuggestions.hidden=true;productInput.setAttribute('aria-expanded','false');activeProductIndex=-1}
function selectProduct(product){selectedProduct=product;productInput.value=product.name;hideProductSuggestions();$('#qtyInput').focus()}
function renderProductSuggestions(){
  if(!products.length){hideProductSuggestions();return}
  productMatches=findProducts(productInput.value);activeProductIndex=-1;
  if(!productMatches.length){productSuggestions.replaceChildren();productSuggestions.hidden=false;productInput.setAttribute('aria-expanded','true');const emptyResult=document.createElement('p');emptyResult.className='product-no-result';emptyResult.textContent='일치하는 등록 품목이 없습니다.';productSuggestions.appendChild(emptyResult);return}
  const options=productMatches.map((product,index)=>{
    const option=document.createElement('button');option.type='button';option.className='product-suggestion';option.dataset.index=index;option.setAttribute('role','option');
    const name=document.createElement('strong');name.textContent=product.name;
    const meta=document.createElement('span');meta.textContent=`${product.product_type} · ${product.report_number}`;
    option.append(name,meta);return option;
  });
  productSuggestions.replaceChildren(...options);productSuggestions.hidden=false;productInput.setAttribute('aria-expanded','true');
}
function updateProductHighlight(){productSuggestions.querySelectorAll('.product-suggestion').forEach((option,index)=>{const activeOption=index===activeProductIndex;option.classList.toggle('active',activeOption);option.setAttribute('aria-selected',String(activeOption));if(activeOption)option.scrollIntoView({block:'nearest'})})}

async function loadProducts(){
  if(!currentUser)return;
  productHelp.textContent='품명 목록을 불러오는 중…';
  const {data:rows,error}=await shipping.from('products').select('id,name,report_number,product_type,shelf_life,display_order').eq('is_active',true).order('display_order');
  if(error){products=[];productHelp.textContent='품명 DB를 불러오지 못했습니다. 03_create_products.sql을 확인해 주세요.';return}
  products=rows||[];productHelp.textContent=`등록 품목 ${products.length}개 · 품명이나 초성으로 검색하세요.`;
}

function createItemRow(item,index){
  const row=document.createElement('div');row.className='item-row';
  const info=document.createElement('div');info.className='item-info';
  const name=document.createElement('strong');name.textContent=item.name;info.appendChild(name);
  const controls=document.createElement('div');controls.className='quantity-control';
  controls.innerHTML=`<button data-action="minus" data-index="${index}" aria-label="수량 줄이기">−</button><b>${item.qty}</b><button data-action="plus" data-index="${index}" aria-label="수량 늘리기">＋</button>`;
  const remove=document.createElement('button');remove.className='remove';remove.dataset.action='remove';remove.dataset.index=index;remove.setAttribute('aria-label','삭제');remove.textContent='×';
  row.append(info,controls,remove);return row;
}

function render(){
  const rows=data[active],subtotal=rows.reduce((sum,item)=>sum+item.qty,0),grand=totals();
  $('#categoryTitle').textContent=labels[active];$('#categorySubtotal').textContent=`${subtotal.toLocaleString()}개`;
  $('#grandTotal').textContent=grand.toLocaleString();$('#footerTotal').textContent=grand.toLocaleString();$('#itemCount').textContent=rows.length;
  const filled=Object.values(data).filter(category=>category.length).length;$('#filledCategories').textContent=filled;$('#progressBar').style.width=`${filled/5*100}%`;
  document.querySelectorAll('.category-tabs button').forEach(btn=>{btn.classList.toggle('active',btn.dataset.category===active);btn.querySelector('b').textContent=data[btn.dataset.category].length});
  list.replaceChildren(...rows.map(createItemRow));empty.style.display=rows.length?'none':'block';list.style.display=rows.length?'block':'none';
}

function buildExcelTable(){
  const categories=Object.keys(labels),productRows=new Map();
  categories.forEach((category,categoryIndex)=>{
    data[category].forEach(item=>{
      const key=item.key||normalizeName(item.name);
      if(!productRows.has(key))productRows.set(key,{name:item.name,quantities:Array(categories.length).fill(0)});
      productRows.get(key).quantities[categoryIndex]+=Number(item.qty)||0;
    });
  });
  return [...productRows.values()].map(item=>[item.name,...item.quantities]);
}

async function downloadExcel(){
  if(!totals()){showToast('다운로드할 출고품목이 없습니다.');return}
  if(!window.ExcelJS){showToast('엑셀 모듈을 불러오지 못했습니다. 다시 시도해 주세요.');return}
  const button=$('#excelBtn');button.disabled=true;button.textContent='생성 중…';
  try{
    const workbook=new window.ExcelJS.Workbook();
    workbook.creator='톰슨팩토리';workbook.created=new Date();
    const worksheet=workbook.addWorksheet('당일 출고',{views:[{state:'frozen',ySplit:4}]});
    worksheet.mergeCells('A1:F1');worksheet.getCell('A1').value='톰슨팩토리 당일 출고일지';
    worksheet.getCell('A2').value='출고일자';worksheet.getCell('B2').value=new Date(date.getFullYear(),date.getMonth(),date.getDate());worksheet.getCell('B2').numFmt='yyyy-mm-dd';
    worksheet.addRow([]);
    const headerRow=worksheet.addRow(['품명',...Object.values(labels)]);
    buildExcelTable().forEach(row=>worksheet.addRow(row));
    const lastDataRow=worksheet.lastRow.number;

    worksheet.columns=[{width:30},{width:17},{width:15},{width:21},{width:12},{width:12}];
    worksheet.getCell('A1').font={name:'Arial',size:16,bold:true,color:{argb:'FF192238'}};
    worksheet.getCell('A1').alignment={vertical:'middle',horizontal:'left'};worksheet.getRow(1).height=28;
    worksheet.getRow(2).font={name:'Arial',size:10};
    headerRow.height=32;headerRow.font={name:'Arial',size:10,bold:true,color:{argb:'FFFFFFFF'}};headerRow.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF16243C'}};headerRow.alignment={vertical:'middle',horizontal:'center',wrapText:true};
    const thinBorder={top:{style:'thin',color:{argb:'FFB8C1CF'}},left:{style:'thin',color:{argb:'FFB8C1CF'}},bottom:{style:'thin',color:{argb:'FFB8C1CF'}},right:{style:'thin',color:{argb:'FFB8C1CF'}}};
    for(let rowNumber=headerRow.number;rowNumber<=lastDataRow;rowNumber++){
      const row=worksheet.getRow(rowNumber);row.height=rowNumber===headerRow.number?32:22;
      for(let columnNumber=1;columnNumber<=6;columnNumber++){
        const cell=row.getCell(columnNumber);cell.border=thinBorder;cell.alignment={vertical:'middle',horizontal:columnNumber===1?'left':'right'};
        if(columnNumber>1)cell.numFmt='#,##0';
      }
    }
    headerRow.alignment={vertical:'middle',horizontal:'center',wrapText:true};
    worksheet.autoFilter={from:{row:headerRow.number,column:1},to:{row:lastDataRow,column:6}};
    const buffer=await workbook.xlsx.writeBuffer();
    const url=URL.createObjectURL(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    const link=document.createElement('a');link.href=url;link.download=`톰슨팩토리_출고일지_${workDate}.xlsx`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(error){console.error(error);showToast('엑셀 파일을 만들지 못했습니다. 다시 시도해 주세요.')}
  finally{button.disabled=false;button.textContent='엑셀 다운로드'}
}

function openAuth(message=''){$('#authMessage').textContent=message;$('#authModal').classList.add('show');$('#authModal').setAttribute('aria-hidden','false')}
function closeAuth(){$('#authModal').classList.remove('show');$('#authModal').setAttribute('aria-hidden','true')}
function updateAuthUI(user){
  currentUser=user;$('#authModal').classList.toggle('logged-in',Boolean(user));
  $('#accountBtn').textContent=user?'내 계정':'로그인';
  if(user){setSync('클라우드 연결됨','online');$('#authMessage').textContent=user.email||'로그인됨'}else{setSync('로그인 필요');$('#authMessage').textContent=''}
}

async function loadCloud(){
  if(!currentUser)return;
  setSync('불러오는 중','syncing');
  const {data:journal,error}=await shipping.from('journals').select('data,updated_at').eq('user_id',currentUser.id).eq('work_date',workDate).maybeSingle();
  if(error){setSync('동기화 오류');openAuth('데이터베이스 설정이 필요합니다. Supabase 설치 SQL 1단계와 2단계를 실행해 주세요.');return}
  if(journal?.data){data={...emptyData(),...journal.data};cache();render();showToast('저장된 출고일지를 불러왔습니다.')}
  setSync('클라우드 연결됨','online');
}

async function saveCloud(){
  if(!currentUser){openAuth('저장하려면 먼저 로그인해 주세요.');return}
  const button=$('#saveBtn');button.disabled=true;button.textContent='저장 중…';setSync('저장 중','syncing');
  const {error}=await shipping.from('journals').upsert({user_id:currentUser.id,work_date:workDate,data,updated_at:new Date().toISOString()},{onConflict:'user_id,work_date'});
  button.disabled=false;button.textContent='출고일지 저장';
  if(error){setSync('저장 실패');showToast('저장하지 못했습니다. DB 설정을 확인해 주세요.');return}
  setSync('저장 완료','online');showToast('클라우드에 저장되었습니다.');
}

document.querySelectorAll('.category-tabs button').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.category;render()}));
$('#minusBtn').addEventListener('click',()=>{$('#qtyInput').value=Math.max(1,Number($('#qtyInput').value)-1)});
$('#plusBtn').addEventListener('click',()=>{$('#qtyInput').value=Number($('#qtyInput').value||0)+1});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const rawName=productInput.value.trim().replace(/\s+/g,' '),matchedProduct=selectedProduct?.name===rawName?selectedProduct:products.find(product=>normalizeName(product.name)===normalizeName(rawName)),qty=Math.max(1,Number($('#qtyInput').value)||1),key=normalizeName(rawName),existing=data[active].find(item=>item.key===key);
  if(existing){existing.qty+=qty;if(matchedProduct){existing.productId=matchedProduct.id;existing.reportNumber=matchedProduct.report_number}}
  else data[active].push({name:rawName,key,qty,productId:matchedProduct?.id||null,reportNumber:matchedProduct?.report_number||null});
  cache();form.reset();selectedProduct=null;hideProductSuggestions();$('#qtyInput').value=1;productInput.focus();render();
});
productInput.addEventListener('input',()=>{selectedProduct=null;renderProductSuggestions()});
productInput.addEventListener('focus',renderProductSuggestions);
productInput.addEventListener('keydown',event=>{if(productSuggestions.hidden)return;if(event.key==='ArrowDown'){event.preventDefault();activeProductIndex=Math.min(activeProductIndex+1,productMatches.length-1);updateProductHighlight()}else if(event.key==='ArrowUp'){event.preventDefault();activeProductIndex=Math.max(activeProductIndex-1,0);updateProductHighlight()}else if(event.key==='Enter'&&activeProductIndex>=0){event.preventDefault();selectProduct(productMatches[activeProductIndex])}else if(event.key==='Escape'){hideProductSuggestions()}});
productSuggestions.addEventListener('mousedown',event=>{const option=event.target.closest('.product-suggestion');if(!option)return;event.preventDefault();selectProduct(productMatches[Number(option.dataset.index)])});
document.addEventListener('click',event=>{if(!event.target.closest('.product-search'))hideProductSuggestions()});
list.addEventListener('click',event=>{const action=event.target.dataset.action,index=Number(event.target.dataset.index);if(!action)return;if(action==='remove')data[active].splice(index,1);if(action==='plus')data[active][index].qty++;if(action==='minus')data[active][index].qty=Math.max(1,data[active][index].qty-1);cache();render()});
$('#clearBtn').addEventListener('click',()=>{data[active]=[];cache();render()});
$('#excelBtn').addEventListener('click',downloadExcel);
$('#saveBtn').addEventListener('click',saveCloud);$('#accountBtn').addEventListener('click',()=>openAuth());$('#authClose').addEventListener('click',closeAuth);
$('#signInBtn').addEventListener('click',async()=>{const email=$('#authEmail').value.trim(),password=$('#authPassword').value;$('#authMessage').textContent='로그인 중…';const {data:result,error}=await cloud.auth.signInWithPassword({email,password});if(error){$('#authMessage').textContent=error.message;return}updateAuthUI(result.user);closeAuth();await Promise.all([loadCloud(),loadProducts()])});
$('#signUpBtn').addEventListener('click',async()=>{const email=$('#authEmail').value.trim(),password=$('#authPassword').value;$('#authMessage').textContent='계정 생성 중…';const {data:result,error}=await cloud.auth.signUp({email,password});if(error){$('#authMessage').textContent=error.message;return}if(result.session){updateAuthUI(result.user);closeAuth();await Promise.all([loadCloud(),loadProducts()])}else{$('#authMessage').textContent='확인 이메일을 보냈습니다. 인증 후 로그인해 주세요.'}});
$('#signOutBtn').addEventListener('click',async()=>{await cloud.auth.signOut();products=[];productHelp.textContent='로그인하면 품명 DB에서 검색할 수 있습니다.';hideProductSuggestions();updateAuthUI(null);closeAuth();showToast('로그아웃했습니다.')});
cloud.auth.onAuthStateChange((_event,session)=>{updateAuthUI(session?.user||null)});

$('#todayText').textContent=`${date.getMonth()+1}월 ${date.getDate()}일 오늘 출고`;
render();
(async()=>{const {data:{session}}=await cloud.auth.getSession();updateAuthUI(session?.user||null);if(session?.user)await Promise.all([loadCloud(),loadProducts()])})();
