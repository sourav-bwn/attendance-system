// Run with: node --test tests/*.test.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/init\(\);\s*$/,'');
function app(fail=false){
 const nodes={},store={};
 const context=vm.createContext({document:{getElementById:id=>nodes[id]??={value:'',textContent:'',style:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn},classList:{add(){},remove(){}}}},
 localStorage:{getItem:key=>{if(fail)throw Error('blocked');return store[key]??null},setItem:(key,val)=>{if(fail)throw Error('blocked');store[key]=val}}});
 vm.runInContext(script,context);vm.runInContext('render=()=>{}; renderManage=()=>{}; toast=()=>{};',context);
 return {nodes,store,context,run:code=>vm.runInContext(code,context)};
}
test('blocked storage does not stop initialization or attendance controls',()=>{
 const x=app(true);assert.doesNotThrow(()=>x.run('init()'));assert.equal(x.run('students.length'),12);
 assert.doesNotThrow(()=>x.run("setStatus('STU001','P')"));assert.equal(x.run('attendance.STU001'),'P');
 assert.match(x.nodes.saveNote.textContent,/Not saved/);
 assert.doesNotThrow(()=>x.run("markAll('A'); saveDaySilent()"));assert.equal(x.run('attendance.STU001'),'A');
 assert.match(x.nodes.saveNote.textContent,/Not saved/);
});
test('available storage still saves marks and class changes',()=>{
 const x=app();x.run("init(); setStatus('STU001','P')");assert.equal(JSON.parse(x.store[x.run('dayKey()')]).STU001,'P');
 x.nodes.className.listeners.input({target:{value:'New class'}});assert.equal(x.store.attease_class,'New class');
});
test('switching to an unsaved date clears the previous saved note',()=>{
 const x=app();x.run("init(); setStatus('STU001','P')");x.nodes.attDate.value='2030-01-02';x.run('loadDay()');
 assert.equal(x.nodes.saveNote.textContent,'No saved attendance');assert.equal(x.run('Object.keys(attendance).length'),0);
});
test('loading saved marks reports the loaded day rather than stale save time',()=>{
 const x=app();x.run('init()');x.store[x.run('dayKey()')]='{"STU001":"P"}';x.run('loadDay()');
 assert.equal(x.nodes.saveNote.textContent,'Loaded saved attendance');
});
test('clearing the date restores today before loading and saving attendance',()=>{
 const x=app();x.run('init()');const today=x.nodes.attDate.value;x.nodes.attDate.value='';x.nodes.attDate.listeners.change();
 assert.equal(x.nodes.attDate.value,today);x.run("setStatus('STU001','P')");assert.equal(x.store.attease_,undefined);
 assert.equal(JSON.parse(x.store['attease_'+today]).STU001,'P');
});
test('an explicit selected date is kept',()=>{
 const x=app();x.run('init()');x.nodes.attDate.value='2030-01-02';x.nodes.attDate.listeners.change();assert.equal(x.nodes.attDate.value,'2030-01-02');
});
