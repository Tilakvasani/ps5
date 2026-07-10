// Single shared place to compute GST so the "% from settings -> CGST/SGST
// split -> apply to taxable amount" formula only exists once in the backend.
// Previously this was reimplemented separately in orders.js and payments.js,
// and the payments.js copy had drifted to a hardcoded 2.5%/2.5% instead of
// reading the admin's configured gst_rate — see the audit doc §1.3/§4.6.

function round2(n) {
  return +Number(n).toFixed(2);
}

/**
 * calculateGst
 * @param {number} subtotal        - order subtotal before discount
 * @param {number} discountAmount  - coupon/discount amount
 * @param {number} gstRatePct      - total GST percent from settings (e.g. 5 for 5%), split equally into CGST+SGST
 * @param {number} shippingCharge  - shipping charge (not taxed)
 * @returns {{ cgstRate:number, sgstRate:number, taxableAmount:number, cgstAmount:number, sgstAmount:number, totalAmount:number }}
 */
function calculateGst(subtotal, discountAmount, gstRatePct, shippingCharge = 0) {
  const gstPct = parseFloat(gstRatePct || "5.0");
  const cgstRate = gstPct / 2;
  const sgstRate = gstPct / 2;

  const taxableAmount = Math.max(0, Number(subtotal) - Number(discountAmount || 0));
  const cgstAmount = round2(taxableAmount * cgstRate / 100);
  const sgstAmount = round2(taxableAmount * sgstRate / 100);
  const totalAmount = taxableAmount + cgstAmount + sgstAmount + Number(shippingCharge || 0);

  return { cgstRate, sgstRate, taxableAmount, cgstAmount, sgstAmount, totalAmount };
}

module.exports = { calculateGst };
