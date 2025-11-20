async function ask() {
  const q = document.getElementById('query').value;
  const topk = parseInt(document.getElementById('topk').value || '5', 10);
  if (!q || q.trim() === '') return alert('Please type a question');

  document.getElementById('answer').innerText = 'Thinking...';
  document.getElementById('contexts').innerHTML = '';

  const resp = await fetch('/api/ask', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: q, top_k: topk})
  });
  if (!resp.ok) {
    const t = await resp.text();
    document.getElementById('answer').innerText = 'Error: ' + t;
    return;
  }
  const data = await resp.json();
  document.getElementById('answer').innerText = data.answer || JSON.stringify(data, null, 2);

  const ctx = document.getElementById('contexts');
  data.contexts.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'context';
    div.innerHTML = `<strong>#${i+1} (page ${c.page_number})</strong><div>${c.sentence_chunk}</div>`;
    ctx.appendChild(div);
  });
}

document.getElementById('ask').addEventListener('click', ask);
