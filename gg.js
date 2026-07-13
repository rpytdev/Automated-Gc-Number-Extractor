
/*
  Shopify GC Number Auto-Fill — CONSOLE VERSION
  ------------------------------------------------
  Kaise use karein:
    1. Shopify product edit page khulo (jaha "GC Number" field hai) - normal browser mein, already logged in
    2. GC Number field pe MANUALLY click karo taaki editor khul jaye (pehla empty input box dikhna chahiye)
       -- ye step IMPORTANT hai, script khud field open nahi karega
    3. F12 dabao (ya Right Click -> Inspect) -> "Console" tab pe jao
    4. Neeche GC_NUMBERS_RAW mein apne values daalo (comma ya new line se separate karo)
    5. Poora script yaha console mein paste karo aur Enter dabao
    6. Pehle value ke baad script khud "Add item" click karta jayega aur baaki values fill karega
    7. Last mein khud Save button click karna (jaan-bujh kar auto-save nahi rakha, verify karne ke liye)

  Note: IDs (":r7dt:", ":r90j:" jaise) har page load pe change hote hain -
  isliye ye script kisi bhi ID pe depend nahi karta, sirf position (index) se
  input dhoondta hai aur HAR STEP par DOM fresh query karta hai.
*/

(async function () {
  // ===== YAHA APNE GC NUMBERS DAALO =====
  // Comma se ya naye line se separate karo, jo bhi easy lage
  const GC_NUMBERS_RAW = `
41-044-20
41-044-27
41-044-21
41-044-28
41-044-22
41-044-29
41-044-43
20-062-00
20-062-01
47-044-12
47-044-07
47-044-17
47-044-08
47-044-27
41-044-30
41-044-31
47-044-37
47-044-66
47-044-38
47-044-67
41-044-53
41-044-54
41-044-55
41-044-57
41-044-44
41-044-44 R1
41-044-60
41-044-78
41-694-20 R6 (0010021828)
41-044-60 R1
41-044-60 R2
41-044-60 R4
41-044-45
41-044-45 R1
41-044-61
41-044-79
41-694-21 R6 (0010021829)
41-044-61 R1
41-044-61 R2
41-044-61 R4
41-044-46
41-044-46 R1
41-044-66
41-044-62
41-044-81
41-044-80
41-694-23 R6 (0010021831)
41-694-22 R6 (0010021830)
41-044-66 R1
41-044-62 R1
41-044-66 R2
41-044-62 R2
41-044-66 R4
41-044-62 R4
41-044-47
41-044-47 R1
41-044-63
41-044-82
41-694-24 R6 (0010021832)
41-044-63 R1
41-044-63 R2
41-044-63 R4
41-044-48
41-044-48 R1
41-044-67
41-044-64
41-044-84
41-044-83
41-694-26 R6 (0010021834)
41-694-25 R6 (0010021833)
41-044-67 R1
41-044-64 R1
41-044-67 R2
41-044-64 R2
41-044-67 R4
41-044-64 R4
41-044-52
41-044-65
41-044-85
41-044-65 R1
41-044-65 R2
41-044-65 R4
41-694-27 R6 (0010021835)
47-044-31
47-044-31 R1
47-044-31 R2
47-044-40
47-044-40 R1
47-044-40 R2
47-044-40 R4
47-044-83 R6 (0010021823)
47-044-57
47-044-32
47-044-32 R1
47-044-32 R3
47-044-32 R5
47-044-46
47-044-41
47-044-46 R1
47-044-41 R1
47-044-46 R2
47-044-41 R2
47-044-46 R4
47-044-41 R4
47-044-85 R6 (0010021825)
47-044-84 R6 (0010021824)
47-044-58
47-044-82 R6 (0010021822)
47-044-53
47-044-33 R1
47-044-33 R3
47-044-42
47-044-42 R1
47-044-42 R2
47-044-42 R4
47-044-86 R6 (0010021826)
47-044-60
47-044-39
47-044-43
47-044-43 R1
47-044-43 R2
47-044-43 R4
47-044-87 R6 (0010021827)
47-044-61 R4
47-044-36 R1
47-044-36 R2
47-044-44
47-044-44 R1
47-044-44 R2
47-044-54
47-044-44 R4
47-044-88 (0010021836)
47-044-30 R1
47-044-30 R2
47-044-47
47-044-45
47-044-47 R1
47-044-45 R1
47-044-47 R2
47-044-45 R2
47-044-55 (0010018495)
47-044-56 (0010018496)
47-044-47 R4
47-044-45 R4
47-044-89 (0010021837)
47-044-90 (0010021838)
47-044-52
41-694-02
47-044-79
47-044-80
47-044-81
41-694-28 (0010021520)
41-694-29 (0010021521)
VU GB 466/4-5 (0010017819)
`;

  const GC_NUMBERS = GC_NUMBERS_RAW
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (GC_NUMBERS.length === 0) {
    console.error("GC_NUMBERS_RAW mein koi value nahi mili. Values daal ke dobara chalao.");
    return;
  }
  console.log(`${GC_NUMBERS.length} GC numbers mile, fill karna shuru kar raha hun...`);

  // Field ka label text - jo widget mein dikhta hai (image ke hisab se "GC Number")
  const FIELD_LABEL_TEXT = "GC Number";

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // React-controlled input mein value set karne ka sahi tarika
  // (seedha .value = x karne se React ka onChange trigger nahi hota)
  function setNativeValue(input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Shopify ye widget ek "portal" mein render karta hai (PolarisPortalsContainer),
  // jo DOM mein anchor field ke paas nahi hota, isliye poori page mein dhoondte hain
  // us container ko jisme field ka label text bhi ho aur "Add item" button bhi ho.
  // Sabse chhota (most specific) matching container select karte hain.
  function getContainer() {
    const allDivs = Array.from(document.querySelectorAll("div"));
    const candidates = allDivs.filter((div) => {
      const text = div.textContent || "";
      return text.includes(FIELD_LABEL_TEXT) && text.includes("Add item");
    });
    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length
    );
    return candidates[0];
  }

  function getInputs(container) {
    return Array.from(container.querySelectorAll("input"));
  }

  // "Add item" button Shopify mein custom element hai (jaise <s-internal-button>),
  // native <button> tag nahi - isliye poori tarah kisi bhi tag mein text match karte hain
  function getAddButton(container) {
    const candidates = Array.from(container.querySelectorAll("*")).filter((el) => {
      const t = (el.textContent || "").trim();
      return t === "Add item";
    });
    if (candidates.length === 0) return null;
    // sabse chhota (innermost) matching element lo - click event bubble hoke
    // upar custom button component tak khud pahunch jayega
    candidates.sort(
      (a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length
    );
    return candidates[0];
  }

  async function waitForInputCount(container, count, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const c = getContainer();
      if (c && getInputs(c).length >= count) return c;
      await sleep(150);
    }
    throw new Error(`Timeout: ${count} input boxes ka wait karte hue time out ho gaya.`);
  }

  // Step 1: field pehle se manually khuli honi chahiye (script khud click nahi karega,
  // kyunki already-khuli field pe click karne se wo TOGGLE karke band ho jaati hai)
  let container = getContainer();
  if (!container) {
    console.error(
      "GC Number field khuli hui nahi mili. Pehle field pe MANUALLY click karke editor khol lo (jaise pehla empty input box dikhna chahiye), fir ye script dobara chalao."
    );
    return;
  }

  await waitForInputCount(container, 1);

  for (let i = 0; i < GC_NUMBERS.length; i++) {
    const value = GC_NUMBERS[i];

    container = getContainer();
    let inputs = getInputs(container);

    if (i >= inputs.length) {
      container = await waitForInputCount(container, i + 1);
      inputs = getInputs(container);
    }

    const target = inputs[i];
    target.focus();
    setNativeValue(target, value);
    target.blur();
    console.log(`[${i + 1}/${GC_NUMBERS.length}] Filled: ${value}`);

    await sleep(250);

    const isLast = i === GC_NUMBERS.length - 1;
    if (!isLast) {
      const addBtn = getAddButton(container);
      if (!addBtn) {
        console.error("Add item button nahi mila.");
        return;
      }
      addBtn.click();
      container = await waitForInputCount(container, i + 2);
    }
  }

  console.log("✅ Saare GC numbers fill ho gaye! Ab Shopify ka Save button click karo (verify karne ke baad).");
})();