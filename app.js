const labels={업소용:'쇼핑몰 업소용',S:'쇼핑몰 S','톰슨몰+거래처':'톰슨몰+거래처',픽업:'픽업',냉장:'냉장'};
const data={업소용:[],S:[],'톰슨몰+거래처':[],픽업:[],냉장:[]};
let active='업소용';
const $=selector=>document.querySelector(selector);
const form=$('#entryForm'),list=$('#itemList'),empty=$('#emptyState');

const normalizeName=name=>name.trim().replace(/\s+/g,' ').toLocaleLowerCase('ko-KR');
const totals=()=>Object.values(data).flat().reduce((sum,item)=>sum+item.qty,0);

function createItemRow(item,index){
  const row=document.createElement('div');
  row.className='item-row';

  const info=document.createElement('div');
  info.className='item-info';
  const name=document.createElement('strong');
  name.textContent=item.name;
  info.appendChild(name);

  const controls=document.createElement('div');
  controls.className='quantity-control';
  controls.innerHTML=`<button data-action="minus" data-index="${index}" aria-label="수량 줄이기">−</button><b>${item.qty}</b><button data-action="plus" data-index="${index}" aria-label="수량 늘리기">＋</button>`;

  const remove=document.createElement('button');
  remove.className='remove';
  remove.dataset.action='remove';
  remove.dataset.index=index;
  remove.setAttribute('aria-label','삭제');
  remove.textContent='×';

  row.append(info,controls,remove);
  return row;
}

function render(){
  const rows=data[active];
  const subtotal=rows.reduce((sum,item)=>sum+item.qty,0);
  const grand=totals();
  $('#categoryTitle').textContent=labels[active];
  $('#categorySubtotal').textContent=`${subtotal.toLocaleString()}개`;
  $('#grandTotal').textContent=grand.toLocaleString();
  $('#footerTotal').textContent=grand.toLocaleString();
  $('#itemCount').textContent=rows.length;
  const filled=Object.values(data).filter(category=>category.length).length;
  $('#filledCategories').textContent=filled;
  $('#progressBar').style.width=`${filled/5*100}%`;
  document.querySelectorAll('.category-tabs button').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.category===active);
    btn.querySelector('b').textContent=data[btn.dataset.category].length;
  });
  list.replaceChildren(...rows.map(createItemRow));
  empty.style.display=rows.length?'none':'block';
  list.style.display=rows.length?'block':'none';
}

document.querySelectorAll('.category-tabs button').forEach(btn=>btn.addEventListener('click',()=>{
  active=btn.dataset.category;
  render();
}));

$('#minusBtn').addEventListener('click',()=>{$('#qtyInput').value=Math.max(1,Number($('#qtyInput').value)-1)});
$('#plusBtn').addEventListener('click',()=>{$('#qtyInput').value=Number($('#qtyInput').value||0)+1});

form.addEventListener('submit',event=>{
  event.preventDefault();
  const rawName=$('#productInput').value.trim().replace(/\s+/g,' ');
  const qty=Math.max(1,Number($('#qtyInput').value)||1);
  const key=normalizeName(rawName);
  const existing=data[active].find(item=>item.key===key);
  if(existing){
    existing.qty+=qty;
  }else{
    data[active].push({name:rawName,key,qty});
  }
  form.reset();
  $('#qtyInput').value=1;
  $('#productInput').focus();
  render();
});

list.addEventListener('click',event=>{
  const action=event.target.dataset.action,index=Number(event.target.dataset.index);
  if(!action)return;
  if(action==='remove')data[active].splice(index,1);
  if(action==='plus')data[active][index].qty++;
  if(action==='minus')data[active][index].qty=Math.max(1,data[active][index].qty-1);
  render();
});

$('#clearBtn').addEventListener('click',()=>{data[active]=[];render()});
$('#saveBtn').addEventListener('click',()=>{const toast=$('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)});
const date=new Date();
$('#todayText').textContent=`${date.getMonth()+1}월 ${date.getDate()}일 오늘 출고`;
render();
