document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#quotationTable tbody");
  const grandTotalEl = document.getElementById("grandTotal");
  const subtotalEl = document.getElementById("subtotal");
  const dateElement = document.getElementById("currentDate");

  let itemCount = 0;

  // Full date format: e.g. "Monday, 18 May 2026"
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── Helpers ─────────────────────────────────────────────

  function fmt(n) {
    return Number(n).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function recalculateTotals() {
    let total = 0;
    tableBody.querySelectorAll("tr").forEach((row) => {
      const cell = row.querySelector("td:nth-child(6)");
      if (cell && cell.dataset.raw) total += parseFloat(cell.dataset.raw);
    });
    if (subtotalEl) subtotalEl.textContent = fmt(total);
    if (grandTotalEl) grandTotalEl.textContent = fmt(total);
  }

  function renumberRows() {
    tableBody.querySelectorAll("tr").forEach((row, i) => {
      row.querySelector("td:first-child").textContent = i + 1;
    });
    itemCount = tableBody.querySelectorAll("tr").length;
  }

  function actionButtons() {
    return `
      <button class="btn-edit"   title="Edit"        onclick="editRow(this.closest('tr'))">&#9998;</button>
      <button class="btn-delete" title="Delete"      onclick="deleteRow(this.closest('tr'))">&#10005;</button>
      <button class="btn-move"   title="Move up"     onclick="moveUp(this.closest('tr'))">&#8593;</button>
      <button class="btn-move"   title="Move down"   onclick="moveDown(this.closest('tr'))">&#8595;</button>`;
  }

  function createRow(num, description, measurements, quantity, unitPrice) {
    const total = quantity * unitPrice;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${num}</td>
      <td>${description}</td>
      <td>${measurements}</td>
      <td>${quantity}</td>
      <td data-raw="${unitPrice}">${fmt(unitPrice)}</td>
      <td data-raw="${total}">${fmt(total)}</td>
      <td class="no-print action-cell">${actionButtons()}</td>`;
    return row;
  }

  // ── Add item ─────────────────────────────────────────────

  window.addItem = function () {
    const description = document.getElementById("description").value.trim();
    const measurements = document.getElementById("measurements").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const unitPrice = parseFloat(document.getElementById("unitPrice").value);

    if (!description || !measurements || !(quantity > 0) || !(unitPrice > 0)) {
      alert("Please fill in all fields with valid information.");
      return;
    }

    itemCount++;
    tableBody.appendChild(createRow(itemCount, description, measurements, quantity, unitPrice));
    recalculateTotals();

    document.getElementById("description").value = "";
    document.getElementById("measurements").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("unitPrice").value = "";
    document.getElementById("description").focus();
  };

  // ── Inline edit ───────────────────────────────────────────

  window.editRow = function (row) {
    if (row.classList.contains("editing-row")) return;

    const cells = row.querySelectorAll("td");
    row.dataset.origDesc  = cells[1].textContent;
    row.dataset.origMeas  = cells[2].textContent;
    row.dataset.origQty   = cells[3].textContent;
    row.dataset.origPrice = cells[4].dataset.raw;
    row.dataset.origTotal = cells[5].dataset.raw;

    cells[1].innerHTML = `<input class="edit-input" type="text"   value="${cells[1].textContent}" />`;
    cells[2].innerHTML = `<input class="edit-input" type="text"   value="${cells[2].textContent}" />`;
    cells[3].innerHTML = `<input class="edit-input" type="number" value="${cells[3].textContent}" min="1" style="max-width:60px;" />`;
    cells[4].innerHTML = `<input class="edit-input" type="number" value="${cells[4].dataset.raw}"  min="0" step="0.01" style="max-width:90px;" />`;
    cells[5].innerHTML = `<em style="color:#999;font-size:0.82em;">auto</em>`;
    cells[6].innerHTML = `
      <button class="btn-save"   onclick="saveRow(this.closest('tr'))">&#10003; Save</button>
      <button class="btn-cancel" onclick="cancelEdit(this.closest('tr'))">Cancel</button>`;

    row.classList.add("editing-row");
    cells[1].querySelector("input").focus();
    cells[1].querySelector("input").select();
  };

  window.saveRow = function (row) {
    const cells = row.querySelectorAll("td");
    const description = cells[1].querySelector("input").value.trim();
    const measurements = cells[2].querySelector("input").value.trim();
    const quantity     = parseInt(cells[3].querySelector("input").value);
    const unitPrice    = parseFloat(cells[4].querySelector("input").value);

    if (!description || !measurements || !(quantity > 0) || !(unitPrice > 0)) {
      alert("Please fill in all fields with valid information.");
      return;
    }

    const total = quantity * unitPrice;
    cells[1].textContent = description;
    cells[2].textContent = measurements;
    cells[3].textContent = quantity;
    cells[4].textContent  = fmt(unitPrice);
    cells[4].dataset.raw  = unitPrice;
    cells[5].textContent  = fmt(total);
    cells[5].dataset.raw  = total;
    cells[6].innerHTML    = actionButtons();

    row.classList.remove("editing-row");
    recalculateTotals();
  };

  window.cancelEdit = function (row) {
    const cells     = row.querySelectorAll("td");
    const unitPrice = parseFloat(row.dataset.origPrice);
    const total     = parseFloat(row.dataset.origTotal);

    cells[1].textContent = row.dataset.origDesc;
    cells[2].textContent = row.dataset.origMeas;
    cells[3].textContent = row.dataset.origQty;
    cells[4].textContent  = fmt(unitPrice);
    cells[4].dataset.raw  = unitPrice;
    cells[5].textContent  = fmt(total);
    cells[5].dataset.raw  = total;
    cells[6].innerHTML    = actionButtons();

    row.classList.remove("editing-row");
  };

  // ── Delete & reorder ──────────────────────────────────────

  window.deleteRow = function (row) {
    if (confirm("Remove this item from the quotation?")) {
      row.remove();
      renumberRows();
      recalculateTotals();
    }
  };

  window.moveUp = function (row) {
    const prev = row.previousElementSibling;
    if (prev) { tableBody.insertBefore(row, prev); renumberRows(); }
  };

  window.moveDown = function (row) {
    const next = row.nextElementSibling;
    if (next) { tableBody.insertBefore(next, row); renumberRows(); }
  };

  // ── Quick notes ───────────────────────────────────────────

  window.addQuickNote = function (text) {
    const ta = document.getElementById("quickNotes");
    if (!ta) return;
    ta.value = ta.value ? ta.value + "\n" + text : text;
  };

  // ── PDF export ────────────────────────────────────────────

  window.downloadQuotation = function () {
    const editing = tableBody.querySelector(".editing-row");
    if (editing) saveRow(editing);

    // Show notes in PDF only if there is content
    const quickNotes = document.getElementById("quickNotes");
    const notesPrint = document.getElementById("notesPrint");
    if (quickNotes && notesPrint) {
      const text = quickNotes.value.trim();
      if (text) {
        document.getElementById("notesText").textContent = text;
        notesPrint.style.display = "block";
      }
    }

    document.querySelectorAll(".no-print").forEach((el) => (el.style.display = "none"));

    html2pdf()
      .from(document.getElementById("quotationContent"))
      .set({
        margin: [8, 8, 8, 8],
        filename: "Quotation_Marachi_Metal_Fabricators.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        document.querySelectorAll(".no-print").forEach((el) => (el.style.display = ""));
        if (notesPrint) notesPrint.style.display = "none";
      });
  };

  // ── Word export ───────────────────────────────────────────

  window.downloadQuotationAsWord = function () {
    const editing = tableBody.querySelector(".editing-row");
    if (editing) saveRow(editing);

    // Populate print notes before cloning
    const quickNotes = document.getElementById("quickNotes");
    const notesPrint = document.getElementById("notesPrint");
    if (quickNotes && notesPrint) {
      const text = quickNotes.value.trim();
      if (text) {
        document.getElementById("notesText").textContent = text;
        notesPrint.style.display = "block";
      }
    }

    const content = document.getElementById("quotationContent").cloneNode(true);
    content.querySelectorAll(".no-print").forEach((el) => el.remove());
    content.querySelectorAll("input, textarea, button").forEach((el) => (el.style.display = "none"));

    const css = `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Roboto', sans-serif; background: #f4f4f4; }
      .quotation-container { width: 98%; max-width: 860px; margin: 20px auto; background: #fff; padding: 14px; }
      .quotation-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px 10px; }
      .dealers { border-bottom: 2px solid #cd0e3d; font-size: 14px; text-align: center; padding-bottom: 16px; }
      .word { text-align: center; padding: 10px 20px; font-size: 20px; font-weight: 700; letter-spacing: 4px; color: #830606; border-top: 3px solid #830606; border-bottom: 3px solid #830606; margin: 12px 0; }
      .logo img { width: 90px; }
      .quotation-details { display: flex; justify-content: space-between; padding-top: 16px; }
      .quotation-details h2 { font-size: 0.9em; margin-bottom: 4px; }
      .quotation-details p { font-size: 0.85em; }
      .construction-details { padding-top: 14px; }
      .construction-details h2 { font-size: 0.9em; font-weight: 700; color: #830606; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 8px; }
      .client-name, .project-description { padding: 3px 0; font-size: 0.9em; }
      #quotationTable { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
      #quotationTable th, #quotationTable td { border: 1px solid #5a0707; padding: 9px; text-align: left; }
      #quotationTable th { background-color: #830606; color: white; font-size: 0.82em; }
      .footer { margin-top: 60px; display: flex; justify-content: space-around; }
      .footer h3 { font-size: 1em; margin-bottom: 8px; }
      .footer p { font-size: 0.88em; margin-bottom: 4px; }
      .signed { display: flex; align-items: flex-end; gap: 10px; margin: 10px 0; }
      .dot img { width: 56px; margin-bottom: -18px; }
      .totals-table { border-collapse: collapse; min-width: 240px; }
      .totals-table td { padding: 7px 14px; font-size: 0.9em; border: 1px solid #e0e0e0; }
      .totals-table tr.grand td { background-color: #830606; color: white; font-weight: 700; }
    </style>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation</title>${css}</head><body>${content.innerHTML}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Quotation_Marachi_Metal_Fabricators.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (notesPrint) notesPrint.style.display = "none";
  };
});
