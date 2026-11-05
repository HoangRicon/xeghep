/**
 * Sinh đoạn script để chèn mã HTML từ ô Custom Code > Head
 * (meta/link/style/script) giống WPCode. Script trong template không tự chạy
 * nên phải tạo lại thẻ <script> trước khi gắn vào document.head.
 */
export function buildHeadInjectionScript(code: string): string {
  const payload = JSON.stringify(code).replace(/</g, "\\u003c");

  return `(function(){try{var raw=${payload};var t=document.createElement("template");t.innerHTML=raw;function makeScript(node){var s=document.createElement("script");for(var i=0;i<node.attributes.length;i++){s.setAttribute(node.attributes[i].name,node.attributes[i].value);}s.text=node.textContent||"";return s;}function runNested(root){var list=root.querySelectorAll?root.querySelectorAll("script"):[];for(var j=0;j<list.length;j++){var old=list[j];if(old.parentNode){old.parentNode.replaceChild(makeScript(old),old);}}}var nodes=Array.prototype.slice.call(t.content.childNodes);for(var k=0;k<nodes.length;k++){var node=nodes[k];if(node.nodeType===1&&node.tagName==="SCRIPT"){document.head.appendChild(makeScript(node));}else{document.head.appendChild(node);runNested(node);}}}catch(e){console.error("[custom-code] head injection failed",e);}})();`;
}
