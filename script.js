document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#quotationTable tbody");
  const grandTotalEl = document.getElementById("grandTotal");
  const subtotalEl = document.getElementById("subtotal");
  const dateElement = document.getElementById("currentDate");

  let subtotal = 0;
  let itemCount = 0;

  // Function to add a new item to the table
  window.addItem = function () {
    const description = document.getElementById("description").value;
    const measurements = document.getElementById("measurements").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const unitPrice = parseFloat(document.getElementById("unitPrice").value);

    if (description && measurements && quantity > 0 && unitPrice > 0) {
      const total = quantity * unitPrice;
      subtotal += total;
      itemCount++;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${itemCount}</td>
        <td>${description}</td>
        <td>${measurements}</td>
        <td>${quantity}</td>
        <td>${unitPrice.toLocaleString()}</td>
        <td>${total.toLocaleString()}</td>
      `;
      tableBody.appendChild(row);

      // Update subtotal and grand total displays
      subtotalEl.textContent = subtotal.toLocaleString();
      grandTotalEl.textContent = subtotal.toLocaleString();

      // Clear input fields
      document.getElementById("description").value = "";
      document.getElementById("measurements").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("unitPrice").value = "";
    } else {
      alert("Please fill in all fields with valid information.");
    }
  };

  // Function to download the quotation as PDF
  window.downloadQuotation = function () {
    const element = document.getElementById("quotationContent");
    const formSection = document.querySelector(".form");
    const addItemButton = document.querySelector('button[onclick="addItem()"]');

    formSection.style.display = "none";
    addItemButton.style.display = "none";

    html2pdf()
      .from(element)
      .set({
        margin: [10, 10, 10, 10],
        filename: "Quotation_Marachi_Metal_Fabricators.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        formSection.style.display = "flex";
        addItemButton.style.display = "block";
      });
  };

  window.downloadQuotationAsWord = function () {
    const quotationContent = document
      .getElementById("quotationContent")
      .cloneNode(true);

    // Hide input fields and buttons from the Word export
    quotationContent
      .querySelectorAll("input, textarea, button")
      .forEach((el) => (el.style.display = "none"));

    // Inline CSS styles
    const css = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
  
        @font-face {
          font-family: "coolvetica";
          src: url(/assets/coolvetica/coolvetica\ condensed\ rg.otf);
        }
  
        body {
          font-family: "coolvetica";
          background-color: #f4f4f4;
        }
  
        .quotation-container {
          width: 98%;
          max-width: 1200px;
          margin: 20px auto;
          background-color: #fff;
          padding: 14px;
          box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
          position: relative;
        }
  
        .quotation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0px 40px;
          padding-bottom: 10px;
        }
  
        .dealers {
          border-bottom: 1px solid #cd0e3d;
          font-size: 14px;
          text-align: center;
          padding-bottom: 20px;
        }
  
        .quotation-header .name {
          max-width: 40ch;
          margin-left: -32px;
          letter-spacing: 3px;
          font-family: 'Times New Roman', Times, serif;
          font-weight: 700;
        }
  
        .word {
          text-align: center;
          padding: 20px;
          font-size: 25px;
          font-weight: 500;
        }
  
        .quotation-header h1 {
          font-family: "coolvetica";
          font-size: 3em;
          font-weight: 600;
        }
  
        .logo img {
          width: 100px;
          height: auto;
          border-radius: 4px;
        }
  
        .logo p {
          font-size: 1em;
          font-weight: 700;
        }
  
        .quotation-details {
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
        }
  
        .quotation-details input {
          border: none;
          outline: none;
          font-size: 1em;
          font-weight: 500;
        }
  
        .quotation-details h2 {
          font-size: 1em;
        }
  
        .quotation-details p {
          font-size: 0.9em;
        }
  
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
  
        .form input {
          padding: 10px;
          border: 1px solid #696969;
          border-radius: 5px;
          width: 100%;
          max-width: 300px;
        }
  
        button {
          padding: 10px 20px;
          background-color: #af4c51;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
  
        button:hover {
          background-color: #830606;
        }
  
        #quotationTable {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 100px;
        }
  
        #quotationTable th {
          font-size: 0.8em;
        }
  
        #quotationTable th,
        #quotationTable td {
          border: 1px solid #5a0707;
          padding: 10px;
          text-align: left;
        }
  
        #quotationTable th {
          background-color: #830606;
          color: white;
        }
  
        .quotation-total {
          text-align: right;
          margin-top: 20px;
          font-size: 1.2em;
        }
  
        #downloadBtn {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #5a0707;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
  
        #downloadBtn:hover {
          background-color: #66162a;
        }
  
        .construction-details {
          display: flex;
          flex-direction: column;
          padding-top: 20px;
        }
  
        .construction-details label {
          font-size: 1em;
          font-weight: 700;
        }
  
        .details-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
  
        .details-section div {
          width: 45%;
        }
  
        .details-section h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
          color: #333;
        }
  
        .details-section p {
          margin-bottom: 5px;
          font-size: 0.9rem;
          color: #555;
        }
  
        .client-name {
          padding: 5px 0;
        }
  
        .client-name input,
        .project-description textarea {
          border: none;
          outline: none;
          font-size: 1em;
          font-weight: 700;
        }
        .project-description textarea {
          font-size: 1.3em;
        }
  
        .project-description {
          display: flex;
          gap: 5px;
        }
  
        footer {
          margin-top: 1200px;
          display: flex;
          justify-content: space-between;
        }
  
        footer h3 {
          font-size: 1em;
        }
  
        footer p {
          font-size: 10.9em;
        }
  
        .grand {
          background-color: #830606;
          color: white;
        }
  
        .signed {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin: 10px 0;
        }
  
        .dot {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
  
        .dot img {
          width: 60px;
        }
      </style>
    `;

    // Create a Word-compatible HTML structure
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation</title>
        ${css}
      </head>
      <body>${quotationContent.innerHTML}</body>
      </html>
    `;

    // Create a Blob from the HTML
    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "Quotation_Marachi_Metal_Fabricators.doc";

    // Append the link, click it, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Display current date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  dateElement.textContent = formattedDate;
});
