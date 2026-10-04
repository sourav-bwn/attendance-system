// Run with: node --test tests/attendance.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/init\(\);\s*$/,'');
function load(saved){
  const context=vm.createContext({
    document:{getElementById:()=>({value:'2026-10-04'})},
    localStorage:{getItem:()=>saved}
  });
  vm.runInContext(script,context);
  vm.runInContext('loadDay()',context);
  return JSON.parse(vm.runInContext('JSON.stringify(attendance)',context));
}

test('missing, malformed and non-object saved attendance recover as empty',()=>{
  for(const saved of [null,'{broken','null','[]','["P"]','"P"','true','42']){
    assert.deepEqual(load(saved),{},String(saved));
  }
});

test('valid present, absent and leave marks survive reload',()=>{
  const marks={STU001:'P',STU002:'A',STU003:'L'};
  assert.deepEqual(load(JSON.stringify(marks)),marks);
});

test('invalid statuses do not count as marked or reach exports',()=>{
  assert.deepEqual(load(JSON.stringify({STU001:'P',STU002:'unknown',STU003:1,STU004:null,STU005:'',STU006:{status:'A'}})),{STU001:'P'});
});
