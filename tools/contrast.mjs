import {readFileSync} from 'node:fs';
const css=readFileSync('packages/ui/styles/tokens.css','utf8');
const blocks={light:css.match(/:root,\s*\.ns-light\s*{([^}]*)}/)[1],dark:css.match(/\.dark,\s*\.ns-dark\s*{([^}]*)}/)[1]};
const vars=m=>Object.fromEntries([...m.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)].map(x=>[x[1],x[2]]));
const L=vars(blocks.light), D={...L,...vars(blocks.dark)};
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
const pairs=[['foreground','background',4.5],['card-foreground','card',4.5],['primary-foreground','primary',4.5],['primary','background',4.5],['primary','card',4.5],['primary','sidebar',4.5],['muted-foreground','background',4.5],['muted-foreground','muted',4.5],['muted-foreground','card',4.5],['muted-foreground','sidebar',4.5],['secondary-foreground','secondary',4.5],['accent-foreground','accent',4.5],['sidebar-foreground','sidebar',4.5],['sidebar-accent-foreground','sidebar-accent',4.5],['destructive','background',4.5],['ring','background',3],['border','background',3],['chart-5','card',4.5],['chart-2','card',4.5],['chart-3','card',4.5],['chart-4','card',4.5],['primary','muted',4.5]];
for(const [n,T] of [['light',L],['dark',D]]) for(const [f,b,min] of pairs) {const r=cr(T[f],T[b]);console.log(n,f,'on',b,r.toFixed(2),r>=min?'ok':'FAIL(<'+min+')')}