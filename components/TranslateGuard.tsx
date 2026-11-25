'use client';

// ব্রাউজারের "Translate" চাপলে Chrome টেক্সটের চারপাশে <font> ট্যাগ বসায়।
// তখন React ভুল জায়গা থেকে নোড সরাতে/বসাতে গিয়ে পুরো পেজ ভেঙে ফেলত।
// এই প্যাচে সেই ভুল কলগুলো নিরাপদে এড়ানো হয়, ফলে অনুবাদ করলেও পেজ ভাঙে না।
declare global {
  interface Window {
    __bcTranslatePatched?: boolean;
  }
}

if (typeof window !== 'undefined' && !window.__bcTranslatePatched) {
  window.__bcTranslatePatched = true;

  const origRemove = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return origRemove.call(this, child) as T;
  };

  const origInsert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return newNode;
    return origInsert.call(this, newNode, ref) as T;
  };
}

export default function TranslateGuard() {
  return null;
}