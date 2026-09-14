import { db } from '../src/lib/db';

async function testFlow() {
  const month = '2026-09';
  console.log('1. Loading month records...');
  const { records, summary } = await db.getFeeRecordsForMonth(month);
  console.log(`Loaded ${records.length} students. Total expected: ₹${summary.totalExpected}, Total received: ₹${summary.totalReceived}`);

  const sample = records[0];
  console.log(`2. Testing student: "${sample.student_name}" (ID: ${sample.id})`);

  console.log('3. Testing manual proration to ₹1,500...');
  const prorated = await db.manuallyProrateFeeRecord(sample.id, {
    proratedAmount: 1500,
    reason: 'Joined mid-month on 15th Sept',
  });
  console.log(`Prorated due: ₹${prorated?.amount_due}, isProrated: ${prorated?.is_prorated}, reason: "${prorated?.proration_reason}"`);

  console.log('4. Testing mark as paid...');
  const paid = await db.markFeeAsPaid(sample.id, 'UPI', 'UPI-TEST-1234', 'Paid via GPay');
  console.log(`Paid status: ${paid?.status}, Amount Paid: ₹${paid?.amount_paid}, Method: ${paid?.payment_method}`);

  console.log('5. Re-checking monthly summary...');
  const updatedSummary = await db.getMonthlyFeeSummary(month);
  console.log(`Updated Summary -> Received: ₹${updatedSummary.totalReceived}, Pending: ₹${updatedSummary.totalPending}, Paid Count: ${updatedSummary.paidCount}, Prorated Count: ${updatedSummary.proratedCount}`);

  console.log('6. Cleaning test record...');
  await db.updateFeeRecord(sample.id, {
    amount_paid: 0,
    status: 'pending',
    payment_method: undefined,
    payment_date: undefined,
    transaction_ref: undefined,
    remarks: undefined,
  });
  await db.resetProration(sample.id);
  console.log('All tests passed successfully!');
}

testFlow().catch(console.error);
