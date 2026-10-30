const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function boot(search,saved={},blocked=false){
  const links=[{href:'https://pay.cakto.com.br/pv6mh3a_1167035'},{href:'https://example.com/'}];
  const storage={value:JSON.stringify(saved)};
  const context={URL,URLSearchParams,window:{location:{search}},document:{addEventListener(){},querySelectorAll(){return links;}},sessionStorage:{getItem(){if(blocked)throw Error();return storage.value;},setItem(k,v){if(blocked)throw Error();storage.value=v;}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'script.js'),'utf8'),context);
  context.initCheckoutAttribution();
  return {links,storage};
}
test('forwards allowed campaign data only to official checkout',()=>{
  const {links}=boot('?utm_source=facebook&utm_campaign=Teste%20Copo&ad_id=123&fbclid=real-click&email=private');
  const u=new URL(links[0].href);
  assert.equal(u.searchParams.get('utm_campaign'),'Teste Copo');
  assert.equal(u.searchParams.get('ad_id'),'123');
  assert.equal(u.searchParams.get('fbclid'),'real-click');
  assert.equal(u.searchParams.has('email'),false);
  assert.equal(links[1].href,'https://example.com/');
});
test('preserves current session attribution on a return visit',()=>{
  assert.equal(new URL(boot('',{utm_source:'facebook'}).links[0].href).searchParams.get('utm_source'),'facebook');
});
test('new campaign does not inherit the previous ad',()=>{
  const u=new URL(boot('?utm_campaign=new',{ad_id:'old'}).links[0].href);
  assert.equal(u.searchParams.has('ad_id'),false);
});
test('storage blocked, unresolved macros and dummy fbclid do not break checkout',()=>{
  const u=new URL(boot('?utm_source=facebook&utm_content={{ad.name}}&fbclid=fbclid',{},true).links[0].href);
  assert.equal(u.searchParams.get('utm_source'),'facebook');
  assert.equal(u.searchParams.has('utm_content'),false);
  assert.equal(u.searchParams.has('fbclid'),false);
});
test('checkout event still fires once for decorated links and never blocks navigation',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const inline=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const listeners=[],events=[];
  class Element { closest(){return {href:'https://pay.cakto.com.br/pv6mh3a_1167035?utm_source=facebook'};} }
  const fbq=(...args)=>events.push(args);
  const context={URL,Element,window:{fbq},fbq,document:{addEventListener(type,fn){listeners.push(fn);}}};
  vm.createContext(context);
  vm.runInContext(inline,context);
  vm.runInContext(inline,context);
  assert.equal(listeners.length,1);
  let blocked=false;
  listeners[0]({target:new Element(),preventDefault(){blocked=true;}});
  assert.equal(events.filter(e=>e[1]==='InitiateCheckout').length,1);
  assert.equal(blocked,false);
  context.window.fbq=()=>{throw Error('Tracking unavailable');};
  assert.doesNotThrow(()=>listeners[0]({target:new Element()}));
});
test('duplicated source directories remain identical and pixel remains single',()=>{
  for(const name of ['index.html','script.js'])assert.equal(fs.readFileSync(path.join(root,name),'utf8').replace(/\s/g,''),fs.readFileSync(path.join(root,'faturamento-no-copo',name),'utf8').replace(/\s/g,''));
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.equal((html.match(/fbq\('init'/g)||[]).length,1);
  assert.equal((html.match(/fbq\('track', 'PageView'/g)||[]).length,1);
  assert.equal((html.match(/'InitiateCheckout'/g)||[]).length,1);
  assert.equal(html.includes("'Purchase'"),false);
  assert.equal(html.includes('lucro limpo'),false);
  assert.equal(html.includes('promoTimer'),false);
});
