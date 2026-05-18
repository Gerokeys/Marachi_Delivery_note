document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#quotationTable tbody");
  const dateElement = document.getElementById("currentDate");

  let itemCount = 0;
  let editingRow = null;

  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  function renumberRows() {
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row, i) => {
      row.querySelector("td:first-child").textContent = i + 1;
    });
    itemCount = rows.length;
  }

  function createRow(num, description, measurements, quantity) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${num}</td>
      <td>${description}</td>
      <td>${measurements}</td>
      <td>${quantity}</td>
      <td class="no-print action-cell">
        <button class="btn-edit"   title="Edit"   onclick="editItem(this.closest('tr'))">&#9998;</button>
        <button class="btn-delete" title="Delete" onclick="deleteItem(this.closest('tr'))">&#10005;</button>
      </td>
    `;
    return row;
  }

  window.addItem = function () {
    const description = document.getElementById("description").value.trim();
    const measurements = document.getElementById("measurements").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);

    if (!description || !measurements || !(quantity > 0)) {
      alert("Please fill in all fields with valid information.");
      return;
    }

    if (editingRow) {
      const cells = editingRow.querySelectorAll("td");
      cells[1].textContent = description;
      cells[2].textContent = measurements;
      cells[3].textContent = quantity;
      editingRow.classList.remove("editing-row");
      editingRow = null;
      document.getElementById("addItemBtn").textContent = "+ Add Item";
      document.getElementById("cancelEditBtn").style.display = "none";
    } else {
      itemCount++;
      tableBody.appendChild(createRow(itemCount, description, measurements, quantity));
    }

    document.getElementById("description").value = "";
    document.getElementById("measurements").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("description").focus();
  };

  window.editItem = function (row) {
    if (editingRow) editingRow.classList.remove("editing-row");

    const cells = row.querySelectorAll("td");
    document.getElementById("description").value = cells[1].textContent;
    document.getElementById("measurements").value = cells[2].textContent;
    document.getElementById("quantity").value = cells[3].textContent;

    editingRow = row;
    row.classList.add("editing-row");
    document.getElementById("addItemBtn").textContent = "✓ Update";
    document.getElementById("cancelEditBtn").style.display = "inline-block";
    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
  };

  window.cancelEdit = function () {
    if (editingRow) {
      editingRow.classList.remove("editing-row");
      editingRow = null;
    }
    document.getElementById("description").value = "";
    document.getElementById("measurements").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("addItemBtn").textContent = "+ Add Item";
    document.getElementById("cancelEditBtn").style.display = "none";
  };

  window.deleteItem = function (row) {
    if (confirm("Remove this item from the delivery note?")) {
      row.remove();
      renumberRows();
    }
  };

  window.downloadDelivery = function () {
    const element = document.getElementById("quotationContent");
    document.querySelectorAll(".no-print").forEach((el) => (el.style.display = "none"));

    html2pdf()
      .from(element)
      .set({
        margin: [10, 10, 10, 10],
        filename: "DeliveryNote_Marachi_Metal_Fabricators.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        document.querySelectorAll(".no-print").forEach((el) => (el.style.display = ""));
      });
  };

  window.downloadDeliveryAsWord = function () {
    const content = document.getElementById("quotationContent").cloneNode(true);
    content.querySelectorAll(".no-print").forEach((el) => el.remove());
    content.querySelectorAll("input, textarea, button").forEach((el) => (el.style.display = "none"));

    const css = `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Roboto', sans-serif; background: #f4f4f4; }
      .quotation-container { width: 98%; max-width: 1200px; margin: 20px auto; background: #fff; padding: 14px; }
      .quotation-header { display: flex; justify-content: space-between; align-items: center; padding: 0 40px 10px; }
      .dealers { border-bottom: 2px solid #cd0e3d; font-size: 14px; text-align: center; padding-bottom: 20px; }
      .word { text-align: center; padding: 16px; font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #830606; }
      .logo img { width: 100px; }
      .quotation-details { display: flex; justify-content: space-between; padding-top: 20px; }
      .quotation-details h2 { font-size: 1em; }
      .quotation-details p { font-size: 0.9em; }
      #quotationTable { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
      #quotationTable th, #quotationTable td { border: 1px solid #5a0707; padding: 10px; text-align: left; }
      #quotationTable th { background-color: #830606; color: white; font-size: 0.85em; }
      .footer { margin-top: 60px; display: flex; justify-content: space-around; }
      .footer h3 { font-size: 1em; margin-bottom: 8px; }
      .footer p { font-size: 0.9em; margin-bottom: 4px; }
      .signed { display: flex; align-items: flex-end; gap: 10px; margin: 10px 0; }
      .dot img { width: 60px; margin-bottom: -20px; }
      .acknowledgment-section { border-left: 4px solid #830606; padding: 12px 16px; margin-bottom: 16px; font-style: italic; }
      .construction-details { padding-top: 16px; }
      .construction-details h2 { font-size: 1em; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
      .client-name, .project-description { padding: 4px 0; font-size: 0.9em; }
      .doc-number-value { font-weight: 700; color: #830606; }
    </style>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Delivery Note</title>${css}</head><body>${content.innerHTML}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "DeliveryNote_Marachi_Metal_Fabricators.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.addDeliveryNote = function (text) {
    const ta = document.getElementById("quickNotes");
    if (!ta) return;
    ta.value = ta.value ? ta.value + "\n" + text : text;
  };
});
