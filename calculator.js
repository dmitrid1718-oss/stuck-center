(function(){
'use strict';
const $=id=>document.getElementById(id);
const costs=[['Housing / rent / mortgage','housing'],['Utilities','utilities'],['Groceries and essentials','food'],['Health insurance and care','health'],['Transportation / car insurance','transport'],['Childcare / dependent care','childcare'],['Debt payments','debt'],['Phone service','phone'],['Other recurring costs','other']];
const startup=[['Security deposit','deposit'],['First month’s rent paid upfront','firstRent'],['Utility hookups / deposits','hookups'],['Phone setup / device','phoneSetup'],['Basic furniture / essentials','furniture'],['Moving costs','moving'],['Legal filing / consultation fees','legal'],['Other one-time costs','startupOther']];
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
function fields(container,list,suffix=''){for(const [label,id] of list){const row=document.createElement('div');row.className='budget-row';const l=document.createElement('label');l.htmlFor=id+suffix;l.textContent=label;const input=document.createElement('input');Object.assign(input,{type:'number',id:id+suffix,min:'0',step:'0.01',inputMode:'decimal',placeholder:'0',autocomplete:'off'});row.append(l,input);container.append(row)}}
for(const side of ['A','B'])fields($('fields'+side),costs,side);fields($('startupFields'),startup);
const inputs=[...document.querySelectorAll('#calculator input')];inputs.forEach(el=>el.autocomplete='off');
const value=id=>Number($(id).value)||0;
function runwayEstimate(savings,startupCost,expenses,income,prepaidRent,housing){
 const remaining=savings-startupCost,gap=Math.max(0,expenses-income);
 if(remaining<0)return {remaining,gap,kind:'startup',shortfall:-remaining};
 if(gap===0)return {remaining,gap,kind:'balanced'};
 const firstGap=Math.max(0,gap-Math.min(prepaidRent,housing));
 const months=remaining<firstGap?remaining/firstGap:1+(remaining-firstGap)/gap;
 return {remaining,gap,kind:'runway',months};
}
function compute(){
 const invalid=inputs.some(el=>el.validity.badInput||el.value!==''&&(!Number.isFinite(Number(el.value))||Number(el.value)<0));
 if(invalid){for(const id of ['expensesA','expensesB','balanceA','balanceB','startupTotal','afterStartup','monthlyGap'])$(id).textContent='—';$('runway').textContent='Use valid, non-negative amounts.';$('runwayDetail').textContent='Correct the entry to update the estimate.';return;}
 let expensesB=0;for(const side of ['A','B']){const out=costs.reduce((sum,[,id])=>sum+value(id+side),0);$('expenses'+side).textContent=money(out);$('balance'+side).textContent=money(value('income'+side)-out);if(side==='B')expensesB=out;}
 const total=startup.reduce((sum,[,id])=>sum+value(id),0);$('startupTotal').textContent=money(total);
 if($('savings').value===''||$('incomeB').value===''||!costs.some(([,id])=>$(id+'B').value!=='')){$('afterStartup').textContent='—';$('monthlyGap').textContent='—';$('runway').textContent='Enter Scenario B costs, income, and savings.';$('runwayDetail').textContent='Enter 0 explicitly if there is no income or savings. Blank cost fields are treated as zero.';return;}
 const r=runwayEstimate(value('savings'),total,expensesB,value('incomeB'),value('firstRent'),value('housingB'));
 $('afterStartup').textContent=money(r.remaining);$('monthlyGap').textContent=money(r.gap);
 $('runwayDetail').textContent='Estimate from the start of Scenario B. Prepaid rent offsets month-one housing only; other prepaid costs are not credited. No first-month surplus is assumed.';
 if(r.kind==='startup'){$('runway').textContent='Startup shortfall: '+money(r.shortfall);$('runwayDetail').textContent='Available savings do not cover the startup costs entered. No funded runway is calculated.';}
 else if(r.kind==='balanced'){$('runway').textContent='No monthly shortfall in this estimate.';$('runwayDetail').textContent='A finite runway does not apply. This is not unlimited security: timing, omitted costs, or changes in income may still create a gap.';}
 else $('runway').textContent=r.months>0&&r.months<0.1?'Less than 0.1 month':(Math.floor(r.months*10)/10).toLocaleString('en-US',{maximumFractionDigits:1})+' months';
}
inputs.forEach(el=>el.addEventListener('input',compute));
function clearChecks(){document.querySelectorAll('#paperwork input').forEach(el=>el.checked=false)}
function clearAll(){inputs.forEach(el=>el.value='');clearChecks();compute()}
$('clearBudget').addEventListener('click',()=>{inputs.forEach(el=>el.value='');compute()});$('clearChecklist').addEventListener('click',clearChecks);
function quickExit(){clearAll();document.body.classList.add('exiting');window.location.replace('https://www.weather.gov/')}
$('quickExit').addEventListener('click',e=>{e.preventDefault();quickExit()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();quickExit()}});
window.addEventListener('pagehide',clearAll);window.addEventListener('pageshow',()=>{document.body.classList.remove('exiting');clearAll()});compute();
})();
