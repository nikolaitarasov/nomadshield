/**
 * Headed Chrome walkthrough of NomadShield.
 * Run: node scripts/browser-e2e.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SHOTS = path.join(ROOT, ".e2e-screens");
const BASE = process.env.BASE_URL || "http://localhost:3000";
const failures = [];
const notes = [];

fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });

function fail(msg) {
  failures.push(msg);
  console.error("FAIL:", msg);
}
function ok(msg) {
  notes.push(msg);
  console.log("ok  ", msg);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
}

async function noPageOverflow(page, label) {
  const { client, scroll, overflow } = await page.evaluate(() => {
    const el = document.documentElement;
    return {
      client: el.clientWidth,
      scroll: el.scrollWidth,
      overflow: el.scrollWidth > el.clientWidth + 2,
    };
  });
  if (overflow) fail(`${label}: horizontal overflow (${scroll}px > ${client}px)`);
  else ok(`${label}: no horizontal overflow (${client}px)`);
}

async function hasText(page, text, label) {
  const loc = page.getByText(text, { exact: false }).first();
  if (await loc.count()) {
    ok(`${label}: found “${text.slice(0, 60)}”`);
    return true;
  }
  fail(`${label}: missing “${text}”`);
  return false;
}

async function consoleWatch(page, bucket) {
  page.on("pageerror", (err) => bucket.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.push(`console.error: ${msg.text()}`);
  });
}

const errors = [];

const browser = await chromium.launch({
  channel: "chrome",
  headless: false,
  slowMo: 40,
  args: ["--disable-gpu-sandbox"],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  acceptDownloads: true,
});
const page = await context.newPage();
consoleWatch(page, errors);

try {
  // ——— Landing / calculator ———
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "01-landing-desktop");
  await hasText(page, "Leave the high-tax state", "landing");
  await hasText(page, "workflow tool", "landing disclaimer");
  await hasText(page, "$16,272", "default CA $180k savings");
  await hasText(page, "Audit risk Medium", "default risk");
  await noPageOverflow(page, "landing desktop");

  const savings = page.locator("p.font-mono.text-3xl").first();
  const before = (await savings.textContent())?.trim();
  const calc = page.locator("#calculator");
  await calc.getByLabel("Annual income subject to former-state tax").fill("250000");
  await page.waitForTimeout(200);
  const after = (await savings.textContent())?.trim();
  if (before && after && before !== after) ok(`calculator live update ${before} → ${after}`);
  else fail(`calculator did not live-update (before=${before} after=${after})`);

  await calc.getByRole("button", { name: /^SD/ }).click();
  await page.waitForTimeout(200);
  await hasText(page, "South Dakota is no longer the lazy default", "SD warning");
  await calc.getByRole("button", { name: /^FL/ }).click();

  await page.getByRole("button", { name: /Save this blueprint/i }).click();
  await page.getByLabel("Email").fill("qa@nomadshield.app");
  await page.getByRole("button", { name: "Save blueprint" }).click();
  await hasText(page, "Blueprint saved", "blueprint modal");
  await page.getByRole("button", { name: "Done" }).click();
  await shot(page, "02-calculator-updated");

  // Marketing pages
  for (const [path, needle, file] of [
    ["/pricing", "Three numbers", "03-pricing"],
    ["/compare", "Escapees", "04-compare"],
    ["/faq", "Is this legal", "05-faq"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await hasText(page, needle, path);
    await hasText(page, "workflow tool", `${path} disclaimer`);
    await shot(page, file);
    await noPageOverflow(page, path);
  }

  await page.goto(BASE + "/faq");
  await page.getByText("What is 183 days?").click();
  await hasText(page, "not the only domicile test", "faq expand");

  // Unauth /app
  await page.goto(BASE + "/app", { waitUntil: "networkidle" });
  if (page.url().includes("/login")) ok("/app redirects to login");
  else fail(`/app did not redirect (url=${page.url()})`);

  // Login demo
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await shot(page, "06-login");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/app/, { timeout: 10000 });
  await page.waitForTimeout(600);
  if (page.url().includes("/onboarding")) {
    notes.push("landed on onboarding — finishing");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Open my playbook" }).click();
    await page.waitForURL(/\/app/, { timeout: 8000 });
  }
  await page.waitForTimeout(400);
  await shot(page, "07-overview");
  await hasText(page, "California", "overview from-state");
  await hasText(page, "Florida", "overview target");
  await hasText(page, "Estimated annual savings", "overview savings");
  await noPageOverflow(page, "overview");

  // Checklist index + 6 steps
  await page.goto(BASE + "/app/checklist", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "08-checklist");
  await hasText(page, "Address & mail", "checklist cards");

  await page.goto(BASE + "/app/checklist/1", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "09-step1-mail");
  await hasText(page, "Connect (preview)", "mailbox preview badge");
  if (await page.getByPlaceholder("1001 Brickell Bay Dr").inputValue().then((v) => v.length > 0).catch(() => false)) {
    ok("demo address prefilled");
  } else {
    const street = page.getByPlaceholder("1001 Brickell Bay Dr");
    const val = await street.inputValue().catch(() => "");
    if (!val) {
      await page.getByRole("button", { name: "Connect existing" }).click();
      await street.fill("1001 Brickell Bay Dr");
      await page.getByPlaceholder("PMB 220").fill("PMB 220");
      await page.locator("input").nth(2); // ignore
    }
  }
  await page.getByRole("button", { name: "Save address" }).click();
  await page.getByRole("button", { name: /Simulate inbound mail/i }).click();
  await hasText(page, "inbound event", "webhook simulate");

  await page.goto(BASE + "/app/checklist/2", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "10-step2-presence");
  await hasText(page, "Open presence calendar", "step 2 calendar link");
  // mark remaining required items so happy-path can complete
  const stepChecks = page.locator("li.surface button[aria-label='Toggle']");
  const n2 = await stepChecks.count();
  for (let i = 0; i < n2; i++) {
    const box = stepChecks.nth(i);
    const cls = await box.getAttribute("class");
    if (cls && !cls.includes("bg-accent")) await box.click();
  }

  await page.goto(BASE + "/app/checklist/3", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "11-step3-dl");
  await hasText(page, "FLHSMV", "official DL link");
  await hasText(page, "not a booking API", "no fake DMV API");
  const dateInput = page.locator('input[type="date"]').first();
  if (await dateInput.count()) await dateInput.fill("2026-09-15");
  const skip = page.getByRole("button", { name: /Skip — no vehicle/i }).first();
  if (await skip.count()) await skip.click();
  const n3 = await stepChecks.count();
  for (let i = 0; i < n3; i++) {
    const box = stepChecks.nth(i);
    const cls = await box.getAttribute("class");
    if (cls && !cls.includes("bg-accent")) await box.click();
  }

  await page.goto(BASE + "/app/checklist/4", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "12-step4-voter");
  await hasText(page, "W-2 / payroll", "W-2 callout");
  await hasText(page, "Register to vote in Florida", "FL voter");
  const n4 = await page.locator("li.surface button[aria-label='Toggle']").count();
  for (let i = 0; i < n4; i++) {
    const box = page.locator("li.surface button[aria-label='Toggle']").nth(i);
    const cls = await box.getAttribute("class");
    if (cls && !cls.includes("bg-accent")) await box.click();
  }

  await page.goto(BASE + "/app/checklist/5", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "13-step5-letters");
  await page.getByRole("button", { name: /Quick: voter cancellation/i }).click();
  await page.waitForTimeout(200);
  const n5 = await page.locator("li.surface button[aria-label='Toggle']").count();
  for (let i = 0; i < n5; i++) {
    const box = page.locator("li.surface button[aria-label='Toggle']").nth(i);
    const cls = await box.getAttribute("class");
    if (cls && !cls.includes("bg-accent")) await box.click();
  }

  await page.goto(BASE + "/app/checklist/6", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "14-step6-declaration");
  await hasText(page, "Ready-to-sign packet", "declaration packet");
  await page.getByLabel("Florida county (or skip if TX/SD)").selectOption("miami-dade");
  const [packet] = await Promise.all([
    page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
    page.getByRole("button", { name: "Download packet PDF" }).click(),
  ]);
  if (packet) ok(`packet download: ${packet.suggestedFilename()}`);
  else fail("declaration packet did not download");
  const n6 = await page.locator("li.surface button[aria-label='Toggle']").count();
  for (let i = 0; i < n6; i++) {
    const box = page.locator("li.surface button[aria-label='Toggle']").nth(i);
    const cls = await box.getAttribute("class");
    if (cls && !cls.includes("bg-accent")) await box.click();
  }

  await page.goto(BASE + "/app/checklist", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "15-checklist-done");

  // Shield calendar
  await page.goto(BASE + "/app/shield", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "16-shield");
  await hasText(page, "183-day presence log", "shield title");
  await hasText(page, "common rule of thumb", "183 heuristic copy");
  const monthLabel = (await page.locator("p.text-sm.font-medium").first().textContent()) ?? "";
  if (/June|April|January|February|March|May 2026/i.test(monthLabel)) {
    ok(`shield opened a month with demo nights (${monthLabel.trim()})`);
  } else {
    notes.push(`shield month is ${monthLabel.trim()} (may be current month if it has nights)`);
  }
  const dayBtn = page.locator("button.aspect-square").nth(10);
  await dayBtn.click();
  await page.getByRole("button", { name: "Target domicile" }).click();
  await page.waitForTimeout(200);
  ok("assigned a target-state night");
  await noPageOverflow(page, "shield");

  // Vault
  await page.goto(BASE + "/app/vault", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "17-vault-before");
  const stubs = await page.locator("p.truncate.text-sm.font-medium").count();
  if (stubs >= 6) ok(`vault lists ${stubs} stub files`);
  else fail(`vault stub count ${stubs} < 6`);
  await page.setInputFiles('input[type="file"]', {
    name: "e2e-receipt.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Miami hotel folio — NomadShield e2e"),
  });
  await page.waitForTimeout(500);
  await hasText(page, "e2e-receipt.txt", "uploaded vault file");
  await shot(page, "18-vault-after");

  // Letters
  await page.goto(BASE + "/app/letters", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "19-letters");
  await page.getByText("Gym or club membership").click();
  await page.getByRole("button", { name: /Generate \d+ letter/ }).click();
  await page.waitForTimeout(300);
  await hasText(page, "Gym or club membership", "generated gym letter");
  const [txt] = await Promise.all([
    page.waitForEvent("download", { timeout: 5000 }).catch(() => null),
    page.getByRole("button", { name: ".txt" }).first().click(),
  ]);
  if (txt) ok(`letter txt: ${txt.suggestedFilename()}`);
  else fail("letter .txt did not download");

  // Report
  await page.goto(BASE + "/app/report", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "20-report");
  await hasText(page, "Audit defense report", "report");
  await hasText(page, "not a CPA", "report disclaimer");
  const [pdf] = await Promise.all([
    page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
    page.getByRole("button", { name: "Download defense PDF" }).click(),
  ]);
  if (pdf) {
    const dest = path.join(SHOTS, pdf.suggestedFilename());
    await pdf.saveAs(dest);
    const size = fs.statSync(dest).size;
    if (size > 500) ok(`defense PDF ${pdf.suggestedFilename()} (${size} bytes)`);
    else fail(`defense PDF too small (${size})`);
  } else fail("defense PDF did not download");

  // Settings
  await page.goto(BASE + "/app/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await shot(page, "21-settings");
  await hasText(page, "Disclaimer accepted", "settings disclaimer");
  const [json] = await Promise.all([
    page.waitForEvent("download", { timeout: 5000 }).catch(() => null),
    page.getByRole("button", { name: "Export JSON" }).click(),
  ]);
  if (json) ok(`export json: ${json.suggestedFilename()}`);
  else fail("export JSON did not download");

  await page.getByRole("button", { name: /Texas/i }).click();
  await hasText(page, "Reset checklist", "state-switch confirm");
  await page.getByRole("button", { name: "Cancel" }).click();

  // Logout
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
  await page.locator(".mx-auto").getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(/\/$|\/login/, { timeout: 8000 });
  ok(`logout returned to ${page.url()}`);

  // Mobile landing
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await shot(page, "22-landing-mobile");
  await noPageOverflow(page, "landing mobile 390");
  await hasText(page, "$", "mobile savings visible");
  const calcBox = await page.locator("#calculator").boundingBox();
  if (calcBox && calcBox.y < 900) ok(`mobile calculator starts at y=${Math.round(calcBox.y)}`);
  else fail("mobile calculator not near top of first screens");

  await page.goto(BASE + "/pricing", { waitUntil: "networkidle" });
  await noPageOverflow(page, "pricing mobile");
  await page.goto(BASE + "/compare", { waitUntil: "networkidle" });
  await shot(page, "23-compare-mobile");
  await noPageOverflow(page, "compare mobile");
} catch (err) {
  fail(`uncaught: ${err.stack || err}`);
  try {
    await shot(page, "99-crash");
  } catch {
    /* ignore */
  }
}

const filteredConsole = errors.filter(
  (e) => !e.includes("favicon") && !e.includes("Download the React DevTools"),
);
if (filteredConsole.length) {
  for (const e of filteredConsole.slice(0, 12)) fail(e);
} else ok("no page/console errors");

await browser.close();

console.log("\n—— results ——");
console.log(`${notes.length} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.log(" -", f);
  process.exit(1);
}
