import{Q as B}from"./QResizeObserver.87fc89b1.js";import{B as H,C as O,D as c,r as g,E as n,w as s,F as C,ad as F,k as v,J as _,f as $}from"./index.94941811.js";var R=H({name:"QHeader",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,revealOffset:{type:Number,default:250},bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(t,{slots:V,emit:h}){const{proxy:{$q:d}}=$(),a=O(_,c);if(a===c)return console.error("QHeader needs to be child of QLayout"),c;const i=g(parseInt(t.heightHint,10)),l=g(!0),f=n(()=>t.reveal===!0||a.view.value.indexOf("H")!==-1||d.platform.is.ios&&a.isContainer.value===!0),m=n(()=>{if(t.modelValue!==!0)return 0;if(f.value===!0)return l.value===!0?i.value:0;const e=i.value-a.scroll.value.position;return e>0?e:0}),y=n(()=>t.modelValue!==!0||f.value===!0&&l.value!==!0),q=n(()=>t.modelValue===!0&&y.value===!0&&t.reveal===!0),z=n(()=>"q-header q-layout__section--marginal "+(f.value===!0?"fixed":"absolute")+"-top"+(t.bordered===!0?" q-header--bordered":"")+(y.value===!0?" q-header--hidden":"")+(t.modelValue!==!0?" q-layout--prevent-focus":"")),w=n(()=>{const e=a.rows.value.top,r={};return e[0]==="l"&&a.left.space===!0&&(r[d.lang.rtl===!0?"right":"left"]=`${a.left.size}px`),e[2]==="r"&&a.right.space===!0&&(r[d.lang.rtl===!0?"left":"right"]=`${a.right.size}px`),r});function u(e,r){a.update("header",e,r)}function o(e,r){e.value!==r&&(e.value=r)}function x({height:e}){o(i,e),u("size",e)}function Q(e){q.value===!0&&o(l,!0),h("focusin",e)}s(()=>t.modelValue,e=>{u("space",e),o(l,!0),a.animate()}),s(m,e=>{u("offset",e)}),s(()=>t.reveal,e=>{e===!1&&o(l,t.modelValue)}),s(l,e=>{a.animate(),h("reveal",e)}),s(a.scroll,e=>{t.reveal===!0&&o(l,e.direction==="up"||e.position<=t.revealOffset||e.position-e.inflectionPoint<100)});const b={};return a.instances.header=b,t.modelValue===!0&&u("size",i.value),u("space",t.modelValue),u("offset",m.value),C(()=>{a.instances.header===b&&(a.instances.header=void 0,u("size",0),u("offset",0),u("space",!1))}),()=>{const e=F(V.default,[]);return t.elevated===!0&&e.push(v("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),e.push(v(B,{debounce:0,onResize:x})),v("header",{class:z.value,style:w.value,onFocusin:Q},e)}}});export{R as Q};
