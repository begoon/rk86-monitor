export const MNEMONICS = new Set([
  'aci','adc','add','adi','ana','ani','call','cc','cm','cma','cmc','cmp',
  'cnc','cnz','cp','cpe','cpi','cpo','cz','daa','dad','dcr','dcx','di',
  'ei','hlt','in','inr','inx','jc','jm','jmp','jnc','jnz','jp','jpe',
  'jpo','jz','lda','ldax','lhld','lxi','mov','mvi','nop','ora','ori',
  'out','pchl','pop','push','ral','rar','rc','ret','rim','rlc','rm',
  'rnc','rnz','rp','rpe','rpo','rrc','rst','rz','sbb','sbi','shld',
  'sim','sphl','stc','sta','stax','sub','sui','xchg','xra','xri','xthl',
]);

export const DIRECTIVES = new Set([
  'equ','org','db','dw','dm','ds','end','set','if','endif','else','include',
]);

export const REGISTERS = new Set([
  'a','b','c','d','e','h','l','m','sp','psw','bc','de','hl',
]);
