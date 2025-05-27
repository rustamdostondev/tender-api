export function buildPrompt(tenderRequirements: string, proposalText: string): string {
  return `
You are a tender data analysis assistant.

I will give you two parts of text:
1. A **Tender Document** describing the tender details and the items required.
2. Several **Commercial Proposals** from different companies.

Your task is to:
- Extract tender metadata: tender number, date, and department (assume "Procurement Department" if not explicitly stated).
- Extract the list of bidders from the proposals.
- For each item in the tender, list:
  - ID (starting from 1),
  - name (in Russian),
  - unit of measure (e.g., шт),
  - quantity,
  - and total price offered by each bidder (including delivery/service costs if mentioned in the proposal).
- Create a summary of the **total price** each bidder has quoted (with all costs included).

🔔 Important:
- **Use total price (with VAT and delivery) when available**.
- If the proposal includes a separate delivery/installation fee, **add it to the total**.
- Match tender items to proposal items by their meaning, not just the name.
- If proposal item names are vague, match them using quantity and context.

Return the result in the following **JSON format**:

json
{
  "tender": {
    "number": <number>,
    "date": "<YYYY-MM-DD>",
    "department": "Procurement Department"
  },
  "bidders": [ "Company A", "Company B", ... ],
  "products": [
    {
      "id": 1,
      "name": "<item name in Russian>",
      "unit": "<unit>",
      "quantity": <number>,
      "prices": {   // please use price total price
        "Company A": <price> , //  add total price delivery price
        "Company B": <price>,
        ...
      }
    },
    ...
  ],
  "totals": {
    "Company A": <total sum>,
    "Company B": <total sum>,
    ...
  }
}


**1) Tender document text:**

${tenderRequirements}

### User
Please analyze these two texts parsed from files:

**2) Proposal document text:**  
${proposalText}


Important: return final result in JSON format.

`.trim();
}

export function aiFormatterForTender(text: string) {
  return `
        Clean and summarize this tender document:

        1. Keep all names of people, companies, organizations, and locations in their original language.
        2. Translate only the general structure, headings, and common words into English.
        3. Extract and format these sections clearly:
          - 🏛️ Organization / University Name and Tender Number
          - 📑 Approval information (position, name)
          - 📦 Tender Items Table (with columns: No, Item Description, Image/Label, Unit, Quantity, Required Delivery Date) — keep item names in original language
          - 👥 Submitters (roles and full names)
        4. Format numbers and dates in English style (e.g., 20.2.2025 → 20.02.2025).
        5. At the end, generate a filename using the tender number + organization name + date, preserving original language characters.

        Here is the raw text:
        <<< Paste raw tender text here >>>

        <<<<<

        ${text}

        >>>>>

  `;
}

export function aiFormatterForProposal(text: string) {
  return `
          Clean and summarize this commercial proposal document:

          1. Keep all names (e.g., people, companies, organizations, locations) in their original language (Russian, Uzbek, etc.).
          2. Translate only the general structure and headings into English.
          3. Extract and format the following sections clearly:
            - 🏢 Company Information (name, slogan, address, phones, website)
            - 📄 Proposal Information (number, date, client, document title)
            - 📦 Proposal Details (item name, unit, quantity, unit price, VAT, total — keep item names in the original language)
            - 💰 Total Amount (numeric and in words, do not translate words)
            - ⏱️ Production Time
            - ☎️ Contact Information
            - ✍️ Signature / Authorized By (preserve the original formatting of names and titles)
          4. Convert all number formats to English style (e.g. 5 200 000 → 5,200,000).
          5. At the end, generate a filename using the document title + client name + date. Keep the filename in the original language of the document (e.g., Russian or Uzbek).

          Here is the raw text:
          <<< Paste raw proposal text here >>>

          ${text}

          >>>

  `;
}

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' сум';
}

export interface TenderData {
  tender: {
    number: number;
    date: string;
    department: string;
  };
  bidders: string[];
  products: {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    prices: { [key: string]: number };
  }[];
  totals: { [key: string]: number };
}

export function renderTenderTable(data: TenderData) {
  const html = `
    <h2>Competitive Tender Result Sheet</h2>
    <p><strong>Tender Number:</strong> ${data.tender.number}</p>
    <p><strong>Date:</strong> ${data.tender.date}</p>
    <p><strong>Department:</strong> ${data.tender.department}</p>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Unit</th>
          <th>Qty</th>
          ${data.bidders.map((bidder) => `<th>${bidder}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.products
          .map(
            (product) => `
          <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.unit}</td>
            <td>${product.quantity}</td>
            ${data?.bidders
              .map((bidder: any) => {
                const min = Math.min(...Object.values(product.prices));
                const isLowest = product.prices[bidder] === min;
                return `<td class="${isLowest ? 'low-price-underline' : ''}">${formatPrice(product.prices[bidder])}</td>`;
              })
              .join('')}
          </tr>
        `,
          )
          .join('')}
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4">TOTAL</th>
          ${data.bidders.map((bidder) => `<th>${formatPrice(data.totals[bidder])}</th>`).join('')}
        </tr>
      </tfoot>
    </table>

    <div class="signature">
      Signature: _______________________
    </div>
  `;

  return `<!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8" />
            <title>Dynamic Tender Table</title>
            <style>
              body { font-family: 'Arial', sans-serif; background: #f2f2f2; padding: 40px; }
              .container { background: white; padding: 30px; border: 1px solid #ccc; max-width: 1000px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              h2 { text-align: center; margin-bottom: 20px; text-transform: uppercase; }
              table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: center; }
              th { background-color: #e0e0e0; }
              .low-price-underline { font-weight: bold; background-color:  #4CAF50; }
              .footer { margin-top: 30px; font-size: 12px; text-align: right; }
              .signature { margin-top: 40px; text-align: left; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="container" id="tender-container">
            ${html}
            </div>

            <script src="htmlDat.js"></script>
          </body>
          </html>`;
}
