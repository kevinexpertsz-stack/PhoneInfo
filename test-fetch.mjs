async function test() {
  try {
    const res = await fetch('http://localhost:5173/api/hardware');
    if (!res.ok) {
        console.error("HTTP error", res.status, res.statusText);
        return;
    }
    const data = await res.json();
    console.log("Success! Fetched API:", Object.keys(data));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}
test();
