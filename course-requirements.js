/* Kiểm tra học phần học trước từ dữ liệu K2025 và bảng điểm đã lưu.
 * Chỉ kiểm tra các môn đề nghị học trước theo danh sách K2025.
 */
(() => {
  const input = document.getElementById('m-code') || document.getElementById('check-course-code');
  const panel = document.getElementById('m-course-requirements') || document.getElementById('check-course-result');
  if (!input || !panel) return;

  const normalize = value => String(value || '').trim().toUpperCase();
  const catalog = typeof courseDictionary !== 'undefined' ? courseDictionary : {};
  const list = document.getElementById('check-course-list');
  if (list) Object.entries(catalog).forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.label = name;
    list.appendChild(opt);
  });
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  // Dữ liệu học phần đề nghị học trước K2025 được nhúng trực tiếp làm fallback để hoạt động 100% cả khi mở qua giao thức file://
  const FALLBACK_REQUIREMENTS = {
    "source": "Danh sách học phần đề nghị học trước – áp dụng từ năm học 2025–2026",
    "kind": "recommended_prior_not_mandatory_prerequisite",
    "courses": {
      "MTH00050":["CSC10012"],"CSC10003":["CSC10012"],"CSC10004":["CSC10012"],"CSC10006":["CSC10004"],"CSC10007":["CSC10009"],"CSC10008":["CSC10012"],"CSC10009":["CSC10012"],"CSC13002":["CSC10012","CSC10006"],"CSC14003":["CSC10004"],"CSC10105":["CSC10012"],"CSC11002":["CSC10008"],"CSC11003":["CSC10007","CSC10008"],"CSC11004":["CSC10008"],"CSC11006":["CSC10008"],"CSC11007":["CSC10008"],"CSC11106":["CSC10008"],"CSC11115":["CSC10008"],"CSC11116":["CSC11007"],"CSC11117":["CSC10008"],"CSC11118":["CSC11006","CSC10008"],"CSC11120":["CSC15001"],"CSC11111":["CSC11117","CSC11003"],"CSC11112":["CSC10007"],"CSC11119":["CSC10008"],"CSC12002":["CSC10006"],"CSC12003":["CSC10006"],"CSC12004":["CSC10006"],"CSC12005":["CSC12004"],"CSC12001":["CSC10006"],"CSC12105":["CSC12003","CSC12004"],"CSC12106":["CSC12004","CSC10006"],"CSC17101":["CSC10006","CSC10004"],"CSC12107":["CSC10006","CSC12002"],"CSC12108":["CSC12004","CSC12005"],"CSC12111":["CSC10006","CSC12002"],"CSC13003":["CSC13002"],"CSC13005":["CSC13002"],"CSC13006":["CSC13002"],"CSC13007":["CSC10012"],"CSC13008":["CSC10012","CSC10006"],"CSC13009":["CSC10012","CSC10006"],"CSC13010":["CSC13002"],"CSC13106":["CSC13002"],"CSC13112":["CSC13002"],"CSC13001":["CSC10003"],"CSC13101":["CSC13002"],"CSC13103":["CSC13102"],"CSC13107":["CSC10003"],"CSC13117":["CSC13007"],"CSC13114":["CSC13008"],"CSC13116":["CSC13002"],"CSC13118":["CSC13009"],"CSC14001":["CSC10004"],"CSC14002":["CSC14003"],"CSC14004":["CSC10004"],"CSC14005":["CSC14003"],"CSC14006":["CSC14003"],"CSC14101":["CSC10004"],"CSC14118":["CSC10006"],"CSC14120":["CSC10012"],"CSC14112":["CSC14003"],"CSC14113":["CSC14001"],"CSC14117":["CSC10012"],"CSC14119":["CSC10004"],"CSC14114":["CSC14118"],"CSC14115":["CSC14119"],"CSC14116":["CSC14120"],"CSC14007":["CSC10012","CSC10004"],"CSC15001":["CSC10004","CSC10006"],"CSC15002":["CSC10004","CSC10006"],"CSC15003":["CSC10012"],"CSC15004":["CSC10004"],"CSC15005":["CSC10012"],"CSC15006":["CSC10004"],"CSC15007":["MTH00044","CSC10012"],"CSC15009":["CSC10012","CSC10004"],"CSC15011":["MTH00044","CSC10012"],"CSC15012":["CSC15006"],"CSC15109":["CSC10012"],"CSC15102":["CSC10006"],"CSC15104":["CSC10007","CSC10008"],"CSC15105":["CSC15006"],"CSC15106":["CSC15005"],"CSC15201":["CSC15005"],"CSC15010":["CSC10012","CSC10007"],"CSC15107":["CSC10006"],"CSC15108":["CSC14003"],"CSC16001":["CSC10012"],"CSC16002":["CSC10012"],"CSC16003":["CSC10012"],"CSC16004":["CSC10012","CSC16005"],"CSC16005":["CSC10012"],"CSC16101":["CSC10012"],"CSC16102":["CSC10012","CSC16005"],"CSC16105":["CSC10012","CSC16005"],"CSC16106":["CSC10012"],"CSC16107":["CSC10012"],"CSC16109":["CSC10012"],"CSC16110":["CSC16001"],"CSC16111":["CSC16004"],"CSC16112":["CSC16005"],"CSC16113":["CSC10012"],"CSC16114":["CSC10012"],"CSC17001":["CSC10004"],"CSC17104":["CSC10012"],"CSC17103":["CSC14003","CSC10006"],"CSC17106":["CSC10006","CSC10004","CSC12002"],"CSC17107":["CSC17001"],"CSC18001":["CSC14005"],"CSC18101":["CSC14003","CSC10008"],"CSC18103":["CSC14003"],"CSC18104":["CSC14003"],"CSC18105":["CSC14003"],"CSC18002":["CSC14003"],"CSC15110":["CSC10012"],"CSC18107":["CSC14003"],"CSC15202":["CSC10012"]
    },
    "notes": {
      "CSC12105":{"CSC12004":"Có thể học trước hoặc học song song"},
      "CSC12107":{"CSC12002":"Khuyến khích, không bắt buộc"},
      "CSC12108":{"CSC12005":"Khuyến khích, không bắt buộc"},
      "CSC12111":{"CSC12002":"Khuyến khích, không bắt buộc"},
      "CSC17106":{"CSC12002":"Khuyến khích đối với ngành HTTT; không bắt buộc"}
    }
  };
  let requirements = FALLBACK_REQUIREMENTS;
  let loadError = false;

  function userGrades() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return Array.isArray(user?.stats?.gradesList) ? user.stats.gradesList : [];
    } catch { return []; }
  }
  function isPassed(grade) {
    // Theo bảng điểm hiện tại, điểm >= 5.0 (hệ 10) là đạt.
    const score = Number(grade.score);
    return grade.score !== '' && grade.score != null &&
      Number.isFinite(score) && Math.round(score * 10) / 10 >= 5;
  }
  function statusFor(code) {
    const rows = userGrades().filter(g => normalize(g.code) === code);
    if (rows.some(isPassed)) {
      return { label: 'Đã đạt', color: '#15803d', state: 'passed' };
    }
    if (rows.some(g => typeof hasCourseScore === 'function' && hasCourseScore(g))) {
      return { label: 'Đã học nhưng chưa đạt', color: '#b45309', state: 'studied' };
    }
    return { label: 'Chưa học', color: '#b91c1c', state: 'missing' };
  }
  function render() {
    const raw = normalize(input.value);
    const code = catalog[raw] ? raw : (Object.entries(catalog).find(([id,name]) => normalize(name) === raw)?.[0] || raw);
    if (!code || !catalog[code]) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    panel.hidden = false;
    if (loadError) {
      panel.textContent = 'Không tải được danh sách học phần học trước. Hãy kiểm tra kết nối và tải lại trang.';
      return;
    }
    if (!requirements) {
      panel.textContent = 'Đang tải danh sách học phần học trước…';
      return;
    }
    const prior = requirements.courses?.[code] || [];
    const notes = requirements.notes?.[code] || {};
    const dict = typeof courseDictionary !== 'undefined' ? courseDictionary : {};
    const details = prior.map(id => ({ id, ...statusFor(id), note: notes[id] || '' }));
    const registration = typeof checkMajorRegistrationPrior === 'function'
      ? checkMajorRegistrationPrior(code, userGrades())
      : {allowed:true, applies:false, missing:[]};
    const blocking = registration.applies && !registration.allowed;
    const passed = details.filter(item => item.state === 'passed').length;
    const studied = details.filter(item => item.state === 'studied').length;
    const missing = details.filter(item => item.state === 'missing');
    panel.innerHTML = `
      <div style="font-weight:700;color:#174575;margin-bottom:8px">Kiểm tra học phần học trước: ${escapeHTML(code)}</div>
      ${prior.length ? `
        <div style="font-weight:600;margin-bottom:6px">Học phần đề nghị học trước (${passed} đã đạt, ${studied} đã học nhưng chưa đạt, ${missing.length} chưa học):</div>
        <ul style="padding-left:18px;margin:0">
          ${details.map(item => `<li style="margin-bottom:8px">
            <strong>${escapeHTML(item.id)}</strong> — ${escapeHTML(dict[item.id] || 'Chưa có tên trong danh mục')}
            <div style="color:${item.color};font-weight:600">${escapeHTML(item.label)}</div>
            ${item.state === 'missing' ? '<div style="color:#1d4ed8">Đề nghị học học phần này.</div>' : ''}
            ${item.note ? `<small style="color:#64748b">Ghi chú: ${escapeHTML(item.note)}</small>` : ''}
          </li>`).join('')}
        </ul>
        ${missing.length ? `<div style="margin-top:10px;font-weight:600;color:#1d4ed8">Đề nghị học: ${missing.map(item => escapeHTML(item.id) + ' — ' + escapeHTML(dict[item.id] || 'Chưa có tên trong danh mục')).join('; ')}</div>` : ''}` : '<div>Không có học phần đề nghị học trước trong dữ liệu K2025.</div>'}
      ${registration.applies ? `<div style="margin-top:9px;padding:9px 10px;border-radius:8px;background:${blocking?'#fef2f2':'#ecfdf5'};color:${blocking?'#991b1b':'#166534'};font-weight:700">
        ${blocking ? 'Lưu ý: đề nghị học các môn ' + registration.missing.map(id=>escapeHTML(id)).join(', ') + ' trước.' : 'Đã đáp ứng điều kiện học trước do ứng dụng kiểm tra cho chuyên ngành đã chọn.'}
      </div>` : ''}
      <small style="display:block;margin-top:8px;color:#64748b">
        Tài liệu K2025 dùng thuật ngữ “đề nghị học trước”, không khẳng định môn tiên quyết bắt buộc. Danh sách chỉ dùng để cảnh báo, không chặn nhập điểm.
      </small>`;
  }
  input.addEventListener('input', render);
  input.addEventListener('change', render);
  document.getElementById('m-course-suggestions')?.addEventListener('click', () => setTimeout(render, 0));
  document.getElementById('btn-add-manual')?.addEventListener('click', () => setTimeout(render, 0));
  // Duy trì hiển thị khi tên học phần được cập nhật bằng hàm chọn gợi ý.
  const preview = document.getElementById('m-name-preview');
  if (preview) new MutationObserver(render).observe(preview, {childList:true, characterData:true, subtree:true});
  if (window.location.protocol !== 'file:') {
    fetch('hoc_truoc_K2025.json', {cache:'no-store'})
      .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
      .then(data => { requirements = data; loadError = false; render(); })
      .catch(() => { requirements = FALLBACK_REQUIREMENTS; loadError = false; render(); });
  } else {
    render();
  }
})();
