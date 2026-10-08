// Run with: node --test tests/*.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/init\(\);\s*$/,'');
function setup(saved){
  const nodes={};
  const store={attease_roster:saved};
  const readers=[];
  const context=vm.createContext({
    document:{getElementById:id=>nodes[id]??={value:'',addEventListener(){},classList:{remove(){}},style:{}}},
    localStorage:{getItem:key=>store[key]??null,setItem:(key,val)=>store[key]=val},
    FileReader:class{constructor(){readers.push(this)}readAsArrayBuffer(){}},
    XLSX:{read:data=>({SheetNames:['students'],Sheets:{students:data[0]}}),utils:{sheet_to_json:sheet=>sheet===1?[['UID','Name'],['OLD','Old Student']]:[['UID','Name'],['NEW','New Student']]}},
  });
  vm.runInContext(script,context);
  vm.runInContext('render=()=>{}; renderManage=()=>{}; toast=()=>{};',context);
  return {context,nodes,store,readers,run:code=>vm.runInContext(code,context),json:code=>JSON.parse(vm.runInContext('JSON.stringify('+code+')',context))};
}
test('saved roster ignores invalid rows, blank fields and duplicate UIDs',()=>{
  const x=setup(JSON.stringify([null,42,[],{}, {uid:' X ',name:' Alice ',dept:12,year:2}, {uid:'x',name:'Duplicate'}, {uid:'',name:'Blank'}, {uid:'Y',name:' '} ]));
  x.run('init()');
  assert.deepEqual(x.json('students'),[{uid:'X',name:'Alice',dept:'12',year:'2'}]);
});
test('numeric UIDs normalize to strings and empty saved rosters stay empty',()=>{
  const x=setup(JSON.stringify([{uid:0,name:'Zero'},{uid:12,name:'Twelve'}]));
  x.run('init()'); assert.equal(x.run('students[0].uid'),'0');assert.equal(x.run('students[1].uid'),'12');
  const empty=setup('[]');empty.run('init()');assert.deepEqual(empty.json('students'),[]);
});
test('malformed saved roster still falls back to the default list',()=>{
  const x=setup('{broken'); x.run('init()');assert.equal(x.run('students.length'),12);
});
test('reset roster drops removed students marks and persists retained default marks',()=>{
  const x=setup('[]');x.run("init(); attendance={CUSTOM:'A',STU001:'P'}; resetRoster()");
  assert.deepEqual(x.json('attendance'),{STU001:'P'});
  assert.deepEqual(JSON.parse(x.store[x.run('dayKey()')]),{STU001:'P'});
  assert.equal(x.run('students.length'),12);
});
test('reset writes an empty day when no marked students remain',()=>{
  const x=setup('[]');x.run("init(); attendance={CUSTOM:'L'}; resetRoster()");
  assert.deepEqual(x.json('attendance'),{});
  assert.equal(x.store[x.run('dayKey()')],'{}');
});
