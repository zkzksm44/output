const labels={업소용:'쇼핑몰 업소용',S:'쇼핑몰 S','톰슨몰+거래처':'톰슨몰+거래처',픽업:'픽업',냉장:'냉장'};
const data={업소용:[],S:[],'톰슨몰+거래처':[],픽업:[],냉장:[]};
let active='업소용';
const $=s=>document.querySelector(s);
const form=$('#entryForm'),list=$('#itemList'),empty=$('#emptyState');
function totals(){return Object.values(data).flat().reduce((sum,item)=>sum+item.qty,0)}
function render(){
  const rows=data[active],subtotal=rows.reduce((sum,item)=>sum+item.qty,0),grand=totals();
  $('#categoryTitle').textContent=labels[active];$('#categorySubtotal').textContent=`${subtotal.toLocaleString()}개`;
  $('#grandTotal').textContent=grand.toLocaleString();$('#footerTotal').textContent=grand.toLocaleString();$('#itemCount').textContent=rows.length;
  const filled=Object.values(data).filter(rows=>rows.length).length;$('#filledCategories').textContent=filled;$('#progressBar').style.width=`${filled/5*100}%`;
  document.querySelectorAll('.category-tabs button').forEach(btn=>{btn.classList.toggle('active',btn.dataset.category===active);btn.querySelector('b').textContent=data[btn.dataset.category].length});
  list.innerHTML='';rows.forEach((item,index)=>{const row=document.createElement('div');row.className='item-row';row.innerHTML=`<div class="item-info"><strong>${item.name}</strong><span>${item.spec||'규격 없음'}</span></div><div class="quantity-control"><button data-action="minus" data-index="${index}">−</button><b>${item.qty}</b><button data-action="plus" data-index="${index}">＋</button></div><button class="remove" data-action="remove" data-index="${index}" aria-label="삭제">×</button>`;list.appendChild(row)});
  empty.style.display=rows.length?'none':'block';list.style.display=rows.length?'block':'none';
}
document.querySelectorAll('.category-tabs button').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.category;render()}));
$('#minusBtn').addEventListener('click',()=>{$('#qtyInput').value=Math.max(1,Number($('#qtyInput').value)-1)});$('#plusBtn').addEventListener('click',()=>{$('#qtyInput').value=Number($('#qtyInput').value||0)+1});
form.addEventListener('submit',e=>{e.preventDefault();data[active].push({name:$('#productInput').value.trim(),spec:$('#specInput').value.trim(),qty:Number($('#qtyInput').value)||1});form.reset();$('#qtyInput').value=1;$('#productInput').focus();render()});
list.addEventListener('click',e=>{const action=e.target.dataset.action,index=Number(e.target.dataset.index);if(!action)return;if(action==='remove')data[active].splice(index,1);if(action==='plus')data[active][index].qty++;if(action==='minus')data[active][index].qty=Math.max(1,data[active][index].qty-1);render()});
$('#clearBtn').addEventListener('click',()=>{data[active]=[];render()});
$('#saveBtn').addEventListener('click',()=>{const toast=$('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)});
const d=new Date();$('#todayText').textContent=`${d.getMonth()+1}월 ${d.getDate()}일 오늘 출고`;render();
