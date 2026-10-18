---
title: Table
section: Components
order: 36
description: Styled table elements with a header, body, footer and caption.
---

# Table

The table parts are attributes on the real table elements: `hlmTable`, `hlmTHead`, `hlmTBody`, `hlmTFoot`, `hlmTr`, `hlmTh`, `hlmTd` and `hlmCaption`. Wrap the table in `div[hlmTableContainer]` to let it scroll horizontally.

```html live
<div hlmTableContainer>
  <table hlmTable>
    <caption hlmCaption>Recent invoices</caption>
    <thead hlmTHead>
      <tr hlmTr>
        <th hlmTh>Invoice</th>
        <th hlmTh>Status</th>
        <th hlmTh>Amount</th>
      </tr>
    </thead>
    <tbody hlmTBody>
      <tr hlmTr><td hlmTd>INV001</td><td hlmTd>Paid</td><td hlmTd>$250.00</td></tr>
      <tr hlmTr><td hlmTd>INV002</td><td hlmTd>Pending</td><td hlmTd>$150.00</td></tr>
      <tr hlmTr><td hlmTd>INV003</td><td hlmTd>Unpaid</td><td hlmTd>$350.00</td></tr>
    </tbody>
    <tfoot hlmTFoot>
      <tr hlmTr><td hlmTd colspan="2">Total</td><td hlmTd>$750.00</td></tr>
    </tfoot>
  </table>
</div>
```
## Native

Nothing on native uses the table yet, so this is planned. `apps/native` imports only `HlmButton`, `HlmBadge` and the card parts.
