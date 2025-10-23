
-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Bank Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
    accountnumber SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    account_type VARCHAR(20) NOT NULL, -- e.g., 'Checking', 'Savings'
    balance NUMERIC(15,2) DEFAULT 0.00,
    account_display_number VARCHAR(20) -- For masked display like ***4567
);


-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    transaction_id SERIAL PRIMARY KEY,
    accountnumber INT REFERENCES accounts(accountnumber) ON DELETE CASCADE,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(20) NOT NULL, -- 'Deposit', 'Withdrawal', 'Transfer'
    amount DECIMAL(12,2) NOT NULL,
    balance DECIMAL(15,2),
    description VARCHAR(70) NOT NULL,
    category VARCHAR(50),
    state VARCHAR(20)
	
);


-- Pending Transfers
CREATE TABLE IF NOT EXISTS public.pending_transfers (
    pending_id SERIAL PRIMARY KEY,
    from_account INT REFERENCES public.accounts(accountnumber) ON DELETE CASCADE,
    to_account INT REFERENCES public.accounts(accountnumber) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    description VARCHAR(100)
);


-- Recurring Transfers
CREATE TABLE IF NOT EXISTS public.recurring_transfers (
    recurring_id SERIAL PRIMARY KEY,
    from_account INT REFERENCES public.accounts(accountnumber) ON DELETE CASCADE,
    to_account INT REFERENCES public.accounts(accountnumber) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- e.g., 'weekly', 'monthly'
    start_date TIMESTAMP NOT NULL,
    next_transfer_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'canceled'
    description VARCHAR(100)
);



DROP TRIGGER IF EXISTS transfer_trigger ON transactions;
DROP FUNCTION IF EXISTS update_transfer_balance;

CREATE OR REPLACE FUNCTION update_transfer_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'Transfer' THEN
        -- Subtract from the source account
        UPDATE accounts
        SET balance = balance - NEW.amount
        WHERE accountnumber = NEW.accountnumber;

        -- Add to the other account (the same user’s other account)
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE user_id = (
            SELECT user_id FROM accounts WHERE accountnumber = NEW.accountnumber
        )
        AND accountnumber != NEW.accountnumber;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_trigger
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transfer_balance();


-- Users
INSERT INTO users(username, email, phone_number, password_hash, role)
VALUES
('username1', 'user1@example.com', '555-111-2222', 'hashedpassword1', 'user'),
('username2', 'user2@example.com', '555-222-3333', 'hashedpassword2', 'user');


-- Accounts
-- =========================
INSERT INTO accounts (user_id, account_type, balance, account_display_number)
VALUES
(1, 'Checking', 2000.00, '***4567'),  -- User 1 Checking
(1, 'Savings', 5000.00, '***1234'),   -- User 1 Savings
(2, 'Checking', 1500.00, '***9876');  -- User 2 Checking








INSERT INTO public.transactions (accountnumber, transaction_date, transaction_type, amount, balance, description, category, state) VALUES
(2, '2025-03-28 14:09:37', 'Deposit', 1161.83, 6171.19, 'Gift Deposit', 'Food & Dining', 'MO'),
(3, '2025-12-22 06:19:47', 'Deposit', 150.6, 1658.68, 'Salary Deposit', 'Food & Dining', 'MO'),
(1, '2025-12-05 01:11:46', 'Deposit', 1935.44, 3936.03, 'Salary Deposit', 'Utilities', 'MO'),
(2, '2025-07-19 03:40:04', 'Transfer', 1324.16, 7490.22, 'Transfer Savings to Checking', 'Bills', 'MO'),
(3, '2025-05-24 12:34:58', 'Withdrawal', 1375.64, 274.56, 'Restaurant Bill', 'Bills', 'MO'),
(2, '2025-09-26 18:50:08', 'Withdrawal', 403.97, 7083.58, 'Restaurant Bill', 'Transportation', 'MO'),
(3, '2025-09-30 06:10:02', 'Deposit', 1653.02, 1921.83, 'Cash Deposit', 'Shopping', 'MO'),
(2, '2025-07-04 14:33:03', 'Transfer', 68.74, 7161.49, 'Transfer Savings to Checking', 'Transportation', 'MO'),
(1, '2025-03-22 10:47:30', 'Transfer', 223.45, 3721.81, 'Transfer Checking to Savings', 'Bills', 'MO'),
(3, '2025-05-20 16:26:42', 'Deposit', 1483.77, 3398.15, 'Gift Deposit', 'Entertainment', 'MO'),
(1, '2025-02-13 22:08:25', 'Withdrawal', 1763.88, 1960.25, 'Restaurant Bill', 'Groceries', 'MO'),
(3, '2025-05-09 22:48:05', 'Deposit', 1185.59, 4587.83, 'Gift Deposit', 'Bills', 'MO'),
(2, '2025-09-27 04:19:44', 'Deposit', 1632.17, 8791.05, 'Cash Deposit', 'Groceries', 'MO'),
(3, '2025-09-07 08:40:53', 'Withdrawal', 1679.3, 2917.85, 'Fuel Payment', 'Utilities', 'MO'),
(1, '2025-09-09 22:32:27', 'Withdrawal', 1708.05, 254.22, 'ATM Withdrawal', 'Transportation', 'MO'),
(3, '2025-03-19 00:26:44', 'Withdrawal', 1198.17, 1715.13, 'Fuel Payment', 'Groceries', 'MO'),
(1, '2025-02-03 07:31:52', 'Transfer', 1682.33, -1434.64, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(1, '2025-04-02 19:04:19', 'Deposit', 1436.64, -6.35, 'Salary Deposit', 'Groceries', 'MO'),
(1, '2025-05-11 05:45:11', 'Transfer', 339.8, -350.31, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(3, '2025-01-22 08:27:15', 'Deposit', 554.11, 2264.55, 'Refund Deposit', 'Groceries', 'MO'),
(1, '2025-04-13 02:52:32', 'Withdrawal', 1408.42, -1758.7, 'Online Purchase', 'Utilities', 'MO'),
(1, '2025-08-06 15:04:02', 'Deposit', 1861.49, 109.57, 'Refund Deposit', 'Food & Dining', 'MO'),
(2, '2025-03-31 02:17:17', 'Withdrawal', 1448.17, 7334.76, 'Restaurant Bill', 'Transportation', 'MO'),
(3, '2025-06-25 14:27:51', 'Deposit', 1598.11, 3865.11, 'Refund Deposit', 'Food & Dining', 'MO'),
(3, '2025-01-06 02:33:04', 'Deposit', 899.17, 4771.08, 'Salary Deposit', 'Utilities', 'MO'),
(2, '2025-06-14 11:05:05', 'Deposit', 554.14, 7879.52, 'Salary Deposit', 'Bills', 'MO'),
(3, '2025-03-24 02:59:19', 'Deposit', 1049.95, 5829.07, 'Refund Deposit', 'Shopping', 'MO'),
(1, '2025-12-15 23:15:10', 'Transfer', 1990.91, -1890.1, 'Transfer Checking to Savings', 'Transportation', 'MO'),
(2, '2025-10-06 04:12:45', 'Transfer', 1662.63, 9538.46, 'Transfer Savings to Checking', 'Shopping', 'MO'),
(3, '2025-05-03 12:41:23', 'Deposit', 1560.53, 7386.1, 'Salary Deposit', 'Groceries', 'MO'),
(1, '2025-12-07 16:50:57', 'Deposit', 1866.75, -29.39, 'Salary Deposit', 'Utilities', 'MO'),
(1, '2025-12-04 20:07:59', 'Transfer', 1450.81, -1474.69, 'Transfer Checking to Savings', 'Transportation', 'MO'),
(1, '2025-06-19 19:56:41', 'Withdrawal', 1266.29, -2734.91, 'Online Purchase', 'Entertainment', 'MO'),
(3, '2025-07-05 05:00:01', 'Deposit', 670.57, 8057.37, 'Gift Deposit', 'Shopping', 'MO'),
(3, '2025-02-10 18:11:40', 'Withdrawal', 1256.55, 6803.55, 'ATM Withdrawal', 'Food & Dining', 'MO'),
(2, '2025-12-20 06:35:35', 'Deposit', 1723.5, 11261.28, 'Salary Deposit', 'Bills', 'MO'),
(3, '2025-11-28 01:08:59', 'Deposit', 1332.37, 8136.32, 'Cash Deposit', 'Food & Dining', 'MO'),
(1, '2025-10-13 19:57:06', 'Withdrawal', 233.38, -2960.1, 'Online Purchase', 'Groceries', 'MO'),
(3, '2025-01-28 10:24:25', 'Deposit', 257.77, 8387.47, 'Cash Deposit', 'Transportation', 'MO'),
(1, '2025-10-02 22:08:57', 'Withdrawal', 1623.48, -4575.76, 'ATM Withdrawal', 'Transportation', 'MO'),
(2, '2025-04-11 19:21:27', 'Transfer', 278.11, 11533.92, 'Transfer Savings to Checking', 'Shopping', 'MO'),
(1, '2025-06-30 16:16:53', 'Withdrawal', 612.98, -5183.76, 'Utility Payment', 'Entertainment', 'MO'),
(2, '2025-05-12 14:19:07', 'Deposit', 1636.15, 13165.17, 'Salary Deposit', 'Food & Dining', 'MO'),
(2, '2025-11-28 20:46:39', 'Transfer', 1405.88, 14564.51, 'Transfer Savings to Checking', 'Bills', 'MO'),
(3, '2025-09-14 04:23:50', 'Withdrawal', 1381.1, 7013.63, 'ATM Withdrawal', 'Entertainment', 'MO'),
(3, '2025-04-09 18:33:27', 'Deposit', 1585.54, 8608.21, 'Salary Deposit', 'Bills', 'MO'),
(2, '2025-12-09 04:56:10', 'Deposit', 669.69, 15231.69, 'Gift Deposit', 'Transportation', 'MO'),
(2, '2025-03-30 05:07:31', 'Withdrawal', 603.72, 14633.08, 'Fuel Payment', 'Groceries', 'MO'),
(1, '2025-01-21 06:41:49', 'Transfer', 1306.21, -6483.71, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(2, '2025-06-19 17:04:19', 'Withdrawal', 685.52, 13942.36, 'Utility Payment', 'Food & Dining', 'MO'),
(3, '2025-05-15 02:13:33', 'Deposit', 1650.19, 10265.98, 'Gift Deposit', 'Food & Dining', 'MO'),
(1, '2025-12-06 02:15:48', 'Transfer', 1911.59, -8386.37, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(2, '2025-12-04 19:34:04', 'Transfer', 1575.36, 15514.94, 'Transfer Savings to Checking', 'Food & Dining', 'MO'),
(1, '2025-01-11 02:14:03', 'Deposit', 687.92, -7701.05, 'Refund Deposit', 'Food & Dining', 'MO'),
(3, '2025-03-19 01:35:51', 'Deposit', 1495.16, 11757.36, 'Cash Deposit', 'Food & Dining', 'MO'),
(2, '2025-09-03 13:28:31', 'Transfer', 654.27, 16177.2, 'Transfer Savings to Checking', 'Bills', 'MO'),
(3, '2025-05-17 19:24:36', 'Withdrawal', 1491.19, 10267.92, 'Fuel Payment', 'Bills', 'MO'),
(3, '2025-01-05 14:01:26', 'Deposit', 919.97, 11182.06, 'Refund Deposit', 'Shopping', 'MO'),
(3, '2025-09-28 06:18:04', 'Deposit', 1919.39, 13100.68, 'Salary Deposit', 'Food & Dining', 'MO'),
(3, '2025-06-16 17:31:26', 'Deposit', 1449.08, 14556.17, 'Gift Deposit', 'Groceries', 'MO'),
(3, '2025-10-17 06:10:44', 'Deposit', 483.54, 15037.04, 'Refund Deposit', 'Bills', 'MO'),
(3, '2025-10-03 16:19:31', 'Deposit', 792.15, 15825.74, 'Refund Deposit', 'Groceries', 'MO'),
(2, '2025-07-10 18:59:40', 'Withdrawal', 1946.36, 14232.94, 'Utility Payment', 'Bills', 'MO'),
(2, '2025-11-05 19:54:58', 'Transfer', 1144.14, 15385.28, 'Transfer Savings to Checking', 'Utilities', 'MO'),
(3, '2025-08-10 00:24:10', 'Withdrawal', 269.96, 15549.93, 'ATM Withdrawal', 'Transportation', 'MO'),
(1, '2025-10-05 10:18:25', 'Transfer', 1709.77, -9402.17, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(3, '2025-06-20 04:55:38', 'Deposit', 348.75, 15891.4, 'Cash Deposit', 'Food & Dining', 'MO'),
(3, '2025-06-13 05:12:30', 'Deposit', 588.22, 16471.47, 'Salary Deposit', 'Utilities', 'MO'),
(1, '2025-03-06 05:54:39', 'Transfer', 1811.31, -11218.84, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(1, '2025-12-05 19:08:31', 'Deposit', 391.02, -10823.58, 'Cash Deposit', 'Utilities', 'MO'),
(3, '2025-06-14 19:47:43', 'Deposit', 1680.28, 18160.63, 'Cash Deposit', 'Bills', 'MO'),
(2, '2025-12-15 15:00:54', 'Transfer', 1743.68, 17125.36, 'Transfer Savings to Checking', 'Food & Dining', 'MO'),
(1, '2025-05-11 12:11:08', 'Withdrawal', 1995.34, -12824.36, 'Utility Payment', 'Entertainment', 'MO'),
(2, '2025-05-01 09:46:01', 'Withdrawal', 900.16, 16216.9, 'Restaurant Bill', 'Utilities', 'MO'),
(1, '2025-04-26 00:10:01', 'Withdrawal', 292.71, -13110.27, 'Restaurant Bill', 'Utilities', 'MO'),
(3, '2025-07-03 02:01:17', 'Deposit', 1892.39, 20054.86, 'Cash Deposit', 'Bills', 'MO'),
(1, '2025-05-17 14:49:15', 'Withdrawal', 504.18, -13616.39, 'ATM Withdrawal', 'Shopping', 'MO'),
(2, '2025-10-01 18:43:09', 'Transfer', 704.37, 16920.57, 'Transfer Savings to Checking', 'Shopping', 'MO'),
(3, '2025-11-01 15:29:00', 'Withdrawal', 131.2, 19923.84, 'Online Purchase', 'Shopping', 'MO'),
(3, '2025-06-17 23:47:59', 'Withdrawal', 833.21, 19091.71, 'Utility Payment', 'Bills', 'MO'),
(3, '2025-09-24 14:34:45', 'Withdrawal', 57.65, 19039.88, 'Restaurant Bill', 'Utilities', 'MO'),
(3, '2025-11-08 02:23:17', 'Withdrawal', 478.37, 18557.23, 'Utility Payment', 'Utilities', 'MO'),
(1, '2025-01-11 09:19:17', 'Transfer', 1610.96, -15228.53, 'Transfer Checking to Savings', 'Bills', 'MO'),
(2, '2025-05-16 20:44:19', 'Withdrawal', 1795.54, 15117.36, 'Restaurant Bill', 'Bills', 'MO'),
(2, '2025-11-02 05:42:14', 'Withdrawal', 1237.84, 13876.93, 'ATM Withdrawal', 'Food & Dining', 'MO'),
(2, '2025-09-02 00:27:22', 'Deposit', 1630.29, 15515.04, 'Gift Deposit', 'Bills', 'MO'),
(2, '2025-09-25 22:54:57', 'Transfer', 362.44, 15871.35, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(1, '2025-05-01 19:53:21', 'Transfer', 324.14, -15553.94, 'Transfer Checking to Savings', 'Utilities', 'MO'),
(1, '2025-12-20 12:53:01', 'Transfer', 1454.27, -17002.75, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(1, '2025-10-18 12:19:51', 'Withdrawal', 426.22, -17437.11, 'Restaurant Bill', 'Entertainment', 'MO'),
(3, '2025-04-28 04:00:33', 'Withdrawal', 1214.13, 17336.31, 'ATM Withdrawal', 'Groceries', 'MO'),
(1, '2025-09-02 16:58:34', 'Deposit', 1431.16, -16012.7, 'Cash Deposit', 'Utilities', 'MO'),
(1, '2025-03-18 21:47:30', 'Deposit', 747.94, -15268.26, 'Cash Deposit', 'Transportation', 'MO'),
(2, '2025-01-10 12:04:23', 'Deposit', 503.66, 16368.61, 'Refund Deposit', 'Shopping', 'MO'),
(1, '2025-09-12 11:12:16', 'Transfer', 1270.76, -16533.36, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(3, '2025-06-25 09:05:23', 'Withdrawal', 1172.59, 16166.38, 'Fuel Payment', 'Entertainment', 'MO'),
(3, '2025-11-30 18:19:13', 'Deposit', 1889.55, 18049.43, 'Cash Deposit', 'Groceries', 'MO'),
(2, '2025-07-14 07:14:21', 'Deposit', 1309.97, 17676.86, 'Gift Deposit', 'Food & Dining', 'MO'),
(3, '2025-09-15 08:45:17', 'Deposit', 792.02, 18850.56, 'Cash Deposit', 'Entertainment', 'MO'),
(3, '2025-03-16 02:58:15', 'Deposit', 1795.32, 20655.7, 'Salary Deposit', 'Transportation', 'MO'),
(3, '2025-08-06 10:11:04', 'Deposit', 1302.85, 21960.02, 'Refund Deposit', 'Transportation', 'MO'),
(3, '2025-12-25 10:00:49', 'Deposit', 586.47, 22539.47, 'Salary Deposit', 'Groceries', 'MO'),
(1, '2025-08-16 18:47:05', 'Withdrawal', 1819.06, -18360.67, 'ATM Withdrawal', 'Bills', 'MO'),
(1, '2025-02-14 03:39:12', 'Deposit', 589.44, -17763.58, 'Cash Deposit', 'Bills', 'MO'),
(2, '2025-05-24 01:17:53', 'Deposit', 925.37, 18608.91, 'Cash Deposit', 'Groceries', 'MO'),
(2, '2025-04-18 22:12:59', 'Deposit', 1325.92, 19943.23, 'Refund Deposit', 'Food & Dining', 'MO'),
(3, '2025-08-11 01:09:42', 'Withdrawal', 882.18, 21660.16, 'Restaurant Bill', 'Shopping', 'MO'),
(2, '2025-07-03 14:34:05', 'Withdrawal', 1902.5, 18046.96, 'Utility Payment', 'Groceries', 'MO'),
(2, '2025-07-30 01:59:39', 'Deposit', 1977.16, 20026.86, 'Gift Deposit', 'Shopping', 'MO'),
(2, '2025-07-16 15:49:51', 'Transfer', 556.44, 20573.81, 'Transfer Savings to Checking', 'Groceries', 'MO'),
(1, '2025-01-14 08:43:51', 'Transfer', 1791.81, -19547.87, 'Transfer Checking to Savings', 'Utilities', 'MO'),
(1, '2025-12-29 06:10:54', 'Transfer', 719.29, -20264.25, 'Transfer Checking to Savings', 'Bills', 'MO'),
(1, '2025-04-12 01:57:26', 'Withdrawal', 1684.76, -21940.88, 'Utility Payment', 'Transportation', 'MO'),
(1, '2025-04-08 03:53:46', 'Withdrawal', 1582.43, -23530.09, 'Utility Payment', 'Transportation', 'MO'),
(3, '2025-01-25 11:58:30', 'Deposit', 1987.41, 23641.81, 'Cash Deposit', 'Shopping', 'MO'),
(2, '2025-09-22 20:39:29', 'Transfer', 1620.91, 22197.77, 'Transfer Savings to Checking', 'Groceries', 'MO'),
(2, '2025-12-25 13:08:42', 'Transfer', 1925.89, 24124.74, 'Transfer Savings to Checking', 'Transportation', 'MO'),
(2, '2025-12-16 02:10:52', 'Transfer', 1834.12, 25967.53, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(3, '2025-10-23 21:13:43', 'Deposit', 1130.37, 24769.04, 'Refund Deposit', 'Bills', 'MO'),
(1, '2025-02-24 12:02:59', 'Withdrawal', 1921.57, -25453.96, 'Online Purchase', 'Entertainment', 'MO'),
(3, '2025-05-04 10:28:19', 'Deposit', 1552.38, 26330.55, 'Salary Deposit', 'Utilities', 'MO'),
(2, '2025-09-24 04:58:04', 'Withdrawal', 1147.89, 24828.62, 'Restaurant Bill', 'Shopping', 'MO'),
(3, '2025-09-16 05:18:31', 'Deposit', 1918.36, 28242.68, 'Gift Deposit', 'Shopping', 'MO'),
(1, '2025-04-05 20:15:23', 'Deposit', 1940.02, -23523.75, 'Cash Deposit', 'Shopping', 'MO'),
(3, '2025-09-15 07:42:22', 'Deposit', 1054.09, 29300.45, 'Salary Deposit', 'Groceries', 'MO'),
(1, '2025-10-04 23:27:10', 'Transfer', 1372.52, -24905.28, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(2, '2025-12-14 15:59:49', 'Deposit', 596.96, 25422.58, 'Cash Deposit', 'Bills', 'MO'),
(3, '2025-01-06 01:48:30', 'Withdrawal', 1657.47, 27651.11, 'Utility Payment', 'Bills', 'MO'),
(1, '2025-04-14 20:50:02', 'Deposit', 1867.54, -23039.64, 'Cash Deposit', 'Bills', 'MO'),
(3, '2025-09-28 22:51:23', 'Deposit', 1213.29, 28864.68, 'Gift Deposit', 'Entertainment', 'MO'),
(2, '2025-01-11 13:59:38', 'Withdrawal', 1340.56, 24082.65, 'Fuel Payment', 'Groceries', 'MO'),
(2, '2025-08-03 02:09:22', 'Deposit', 1465.83, 25543.58, 'Gift Deposit', 'Utilities', 'MO'),
(1, '2025-02-12 20:58:36', 'Deposit', 345.75, -22697.7, 'Refund Deposit', 'Bills', 'MO'),
(3, '2025-06-10 06:37:34', 'Withdrawal', 1142.91, 27716.5, 'ATM Withdrawal', 'Entertainment', 'MO'),
(1, '2025-04-04 22:47:13', 'Deposit', 1525.82, -21166.41, 'Refund Deposit', 'Food & Dining', 'MO'),
(2, '2025-07-05 00:04:49', 'Withdrawal', 887.24, 24665.85, 'Utility Payment', 'Food & Dining', 'MO'),
(1, '2025-12-25 16:59:41', 'Withdrawal', 1031.03, -22206.05, 'Utility Payment', 'Groceries', 'MO'),
(1, '2025-05-12 14:00:35', 'Transfer', 1521.25, -23722.21, 'Transfer Checking to Savings', 'Shopping', 'MO'),
(1, '2025-04-05 21:49:12', 'Withdrawal', 1876.42, -25602.52, 'Utility Payment', 'Shopping', 'MO'),
(2, '2025-07-19 10:36:10', 'Transfer', 257.02, 24922.83, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(3, '2025-08-31 19:09:36', 'Withdrawal', 355.34, 27361.3, 'Online Purchase', 'Food & Dining', 'MO'),
(2, '2025-10-18 12:46:35', 'Deposit', 1065.78, 25981.97, 'Cash Deposit', 'Shopping', 'MO'),
(3, '2025-06-26 06:19:55', 'Deposit', 554.97, 27906.34, 'Cash Deposit', 'Groceries', 'MO'),
(1, '2025-06-08 10:23:18', 'Withdrawal', 246.9, -25852.73, 'Online Purchase', 'Groceries', 'MO'),
(2, '2025-01-15 17:16:07', 'Withdrawal', 693.85, 25279.5, 'Restaurant Bill', 'Entertainment', 'MO'),
(1, '2025-04-13 04:37:02', 'Deposit', 1108.88, -24743.8, 'Cash Deposit', 'Shopping', 'MO'),
(2, '2025-12-26 04:52:36', 'Deposit', 243.43, 25514.2, 'Gift Deposit', 'Entertainment', 'MO'),
(3, '2025-02-24 20:59:52', 'Withdrawal', 973.35, 26925.53, 'Restaurant Bill', 'Groceries', 'MO'),
(3, '2025-10-07 10:14:23', 'Deposit', 410.44, 27342.0, 'Salary Deposit', 'Groceries', 'MO'),
(1, '2025-10-08 18:54:21', 'Deposit', 1186.85, -23553.04, 'Refund Deposit', 'Transportation', 'MO'),
(2, '2025-03-04 20:05:19', 'Withdrawal', 1663.61, 23840.66, 'Utility Payment', 'Entertainment', 'MO'),
(1, '2025-04-02 08:12:43', 'Withdrawal', 889.8, -24438.5, 'Online Purchase', 'Shopping', 'MO'),
(1, '2025-03-27 19:50:48', 'Transfer', 229.32, -24660.34, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(1, '2025-05-04 14:53:37', 'Transfer', 1992.89, -26657.01, 'Transfer Checking to Savings', 'Food & Dining', 'MO'),
(1, '2025-05-26 03:08:22', 'Withdrawal', 707.91, -27369.37, 'Fuel Payment', 'Transportation', 'MO'),
(3, '2025-06-16 21:25:47', 'Deposit', 93.64, 27436.28, 'Salary Deposit', 'Shopping', 'MO'),
(2, '2025-06-23 03:49:35', 'Deposit', 1275.34, 25110.98, 'Cash Deposit', 'Food & Dining', 'MO'),
(3, '2025-04-24 19:38:19', 'Withdrawal', 1110.88, 26325.05, 'Online Purchase', 'Entertainment', 'MO'),
(3, '2025-12-01 19:45:57', 'Withdrawal', 1472.09, 24850.15, 'Restaurant Bill', 'Transportation', 'MO'),
(2, '2025-04-01 19:13:09', 'Transfer', 454.38, 25568.07, 'Transfer Savings to Checking', 'Food & Dining', 'MO'),
(3, '2025-05-13 17:29:00', 'Deposit', 1119.4, 25968.3, 'Salary Deposit', 'Transportation', 'MO'),
(3, '2025-04-29 15:45:18', 'Withdrawal', 1356.9, 24608.14, 'Online Purchase', 'Food & Dining', 'MO'),
(1, '2025-03-14 05:50:13', 'Transfer', 1487.22, -28862.65, 'Transfer Checking to Savings', 'Entertainment', 'MO'),
(2, '2025-05-12 14:39:37', 'Deposit', 305.72, 25869.56, 'Cash Deposit', 'Food & Dining', 'MO'),
(1, '2025-03-13 05:06:48', 'Deposit', 1949.69, -26917.34, 'Gift Deposit', 'Shopping', 'MO'),
(3, '2025-11-27 18:09:20', 'Withdrawal', 696.42, 23910.2, 'Restaurant Bill', 'Utilities', 'MO'),
(1, '2025-02-16 08:18:22', 'Transfer', 780.56, -27697.69, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(3, '2025-06-02 05:16:48', 'Withdrawal', 1974.26, 21941.58, 'Restaurant Bill', 'Entertainment', 'MO'),
(3, '2025-05-10 07:21:16', 'Deposit', 1534.43, 23470.15, 'Refund Deposit', 'Utilities', 'MO'),
(3, '2025-04-25 02:21:19', 'Withdrawal', 1241.43, 22223.38, 'Utility Payment', 'Groceries', 'MO'),
(3, '2025-02-17 02:26:17', 'Withdrawal', 1770.01, 20456.26, 'Fuel Payment', 'Groceries', 'MO'),
(3, '2025-04-03 04:25:47', 'Deposit', 947.43, 21413.56, 'Gift Deposit', 'Utilities', 'MO'),
(2, '2025-05-09 21:49:10', 'Deposit', 495.07, 26359.5, 'Cash Deposit', 'Entertainment', 'MO'),
(3, '2025-07-21 19:48:54', 'Deposit', 1285.67, 22698.61, 'Gift Deposit', 'Food & Dining', 'MO'),
(3, '2025-01-22 02:50:48', 'Deposit', 1974.66, 24667.83, 'Cash Deposit', 'Shopping', 'MO'),
(3, '2025-07-02 08:09:27', 'Deposit', 1218.43, 25892.25, 'Refund Deposit', 'Bills', 'MO'),
(1, '2025-10-18 11:21:24', 'Transfer', 1529.57, -29228.02, 'Transfer Checking to Savings', 'Entertainment', 'MO'),
(1, '2025-12-18 11:09:32', 'Withdrawal', 181.58, -29419.51, 'Online Purchase', 'Groceries', 'MO'),
(2, '2025-09-30 14:53:47', 'Withdrawal', 614.11, 25737.39, 'Utility Payment', 'Transportation', 'MO'),
(3, '2025-12-01 10:55:34', 'Deposit', 775.04, 26674.85, 'Refund Deposit', 'Bills', 'MO'),
(2, '2025-08-06 04:41:39', 'Transfer', 1223.83, 26966.45, 'Transfer Savings to Checking', 'Bills', 'MO'),
(3, '2025-02-14 10:11:27', 'Withdrawal', 770.3, 25901.11, 'Utility Payment', 'Transportation', 'MO'),
(1, '2025-12-15 20:10:53', 'Deposit', 863.95, -28565.48, 'Cash Deposit', 'Transportation', 'MO'),
(3, '2025-05-21 02:03:38', 'Deposit', 1086.48, 26981.04, 'Refund Deposit', 'Entertainment', 'MO'),
(3, '2025-05-26 14:43:33', 'Deposit', 1672.23, 28650.8, 'Salary Deposit', 'Food & Dining', 'MO'),
(2, '2025-07-13 00:33:41', 'Withdrawal', 1367.61, 25599.68, 'Utility Payment', 'Bills', 'MO'),
(1, '2025-04-11 11:24:00', 'Withdrawal', 1403.0, -29963.07, 'Fuel Payment', 'Food & Dining', 'MO'),
(3, '2025-08-02 20:25:39', 'Withdrawal', 662.28, 27993.18, 'Restaurant Bill', 'Bills', 'MO'),
(1, '2025-09-21 13:16:07', 'Deposit', 651.92, -29306.3, 'Cash Deposit', 'Utilities', 'MO'),
(2, '2025-05-22 08:52:10', 'Withdrawal', 1518.59, 24090.48, 'Fuel Payment', 'Entertainment', 'MO'),
(1, '2025-08-26 14:55:20', 'Withdrawal', 257.67, -29555.29, 'Fuel Payment', 'Bills', 'MO'),
(3, '2025-11-25 11:30:02', 'Withdrawal', 571.77, 27411.87, 'Fuel Payment', 'Groceries', 'MO'),
(3, '2025-11-19 09:58:49', 'Withdrawal', 908.05, 26498.6, 'Fuel Payment', 'Food & Dining', 'MO'),
(1, '2025-05-12 14:03:41', 'Deposit', 1802.2, -27756.36, 'Refund Deposit', 'Bills', 'MO'),
(1, '2025-10-07 10:28:03', 'Transfer', 93.81, -27846.14, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(3, '2025-12-18 14:46:31', 'Deposit', 1844.21, 28344.87, 'Cash Deposit', 'Groceries', 'MO'),
(2, '2025-01-23 21:06:00', 'Withdrawal', 60.73, 24025.91, 'Utility Payment', 'Shopping', 'MO'),
(3, '2025-12-01 18:13:54', 'Withdrawal', 1244.06, 27100.09, 'Fuel Payment', 'Utilities', 'MO'),
(2, '2025-03-27 14:47:21', 'Transfer', 1881.82, 25900.39, 'Transfer Savings to Checking', 'Transportation', 'MO'),
(2, '2025-03-26 09:06:26', 'Withdrawal', 486.95, 25413.64, 'Restaurant Bill', 'Entertainment', 'MO');




INSERT INTO public.pending_transfers (from_account, to_account, amount, scheduled_date, status, description) VALUES
(1, 2, 1265.15, '2025-07-02 00:00:00', 'pending', 'Scheduled Transfer Checking to Savings'),
(2, 1, 345.42, '2025-07-09 00:00:00', 'failed', 'Scheduled Transfer Savings to Checking'),
(2, 1, 530.88, '2025-01-22 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking'),
(2, 1, 1729.35, '2025-04-21 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking'),
(2, 1, 1415.37, '2025-06-03 00:00:00', 'completed', 'Scheduled Transfer Savings to Checking'),
(1, 2, 355.4, '2025-04-27 00:00:00', 'pending', 'Scheduled Transfer Checking to Savings'),
(2, 1, 1246.16, '2025-07-25 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking'),
(1, 2, 1631.2, '2025-09-03 00:00:00', 'pending', 'Scheduled Transfer Checking to Savings'),
(2, 1, 105.04, '2025-11-09 00:00:00', 'failed', 'Scheduled Transfer Savings to Checking'),
(2, 1, 357.69, '2025-02-06 00:00:00', 'completed', 'Scheduled Transfer Savings to Checking'),
(2, 1, 1703.12, '2025-02-02 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking'),
(1, 2, 1727.2, '2025-03-26 00:00:00', 'pending', 'Scheduled Transfer Checking to Savings'),
(1, 2, 897.68, '2025-10-16 00:00:00', 'completed', 'Scheduled Transfer Checking to Savings'),
(1, 2, 943.91, '2025-10-05 00:00:00', 'pending', 'Scheduled Transfer Checking to Savings'),
(2, 1, 871.08, '2025-10-01 00:00:00', 'failed', 'Scheduled Transfer Savings to Checking'),
(1, 2, 1853.86, '2025-11-08 00:00:00', 'completed', 'Scheduled Transfer Checking to Savings'),
(1, 2, 1400.98, '2025-06-19 00:00:00', 'completed', 'Scheduled Transfer Checking to Savings'),
(2, 1, 1117.04, '2025-08-04 00:00:00', 'failed', 'Scheduled Transfer Savings to Checking'),
(2, 1, 1281.7, '2025-03-12 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking'),
(2, 1, 1054.73, '2025-11-21 00:00:00', 'pending', 'Scheduled Transfer Savings to Checking');

INSERT INTO public.recurring_transfers (from_account, to_account, amount, frequency, start_date, next_transfer_date, status, description) VALUES
(1, 2, 500.47, 'Weekly', '2025-02-27 00:00:00', '2025-03-28 00:00:00', 'active', 'Recurring Transfer Checking to Savings (Weekly)'),
(2, 1, 1098.78, 'Weekly', '2025-02-23 00:00:00', '2025-03-13 00:00:00', 'paused', 'Recurring Transfer Savings to Checking (Weekly)'),
(2, 1, 569.95, 'Weekly', '2025-01-30 00:00:00', '2025-02-11 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Weekly)'),
(1, 2, 1651.91, 'Weekly', '2025-02-02 00:00:00', '2025-03-01 00:00:00', 'active', 'Recurring Transfer Checking to Savings (Weekly)'),
(2, 1, 1376.38, 'Monthly', '2025-01-30 00:00:00', '2025-02-23 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Monthly)'),
(1, 2, 1424.06, 'Weekly', '2025-03-17 00:00:00', '2025-04-11 00:00:00', 'paused', 'Recurring Transfer Checking to Savings (Weekly)'),
(1, 2, 1540.6, 'Weekly', '2025-01-18 00:00:00', '2025-02-10 00:00:00', 'active', 'Recurring Transfer Checking to Savings (Weekly)'),
(2, 1, 1594.38, 'Weekly', '2025-02-20 00:00:00', '2025-03-16 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Weekly)'),
(2, 1, 1494.96, 'Weekly', '2025-01-18 00:00:00', '2025-02-05 00:00:00', 'paused', 'Recurring Transfer Savings to Checking (Weekly)'),
(1, 2, 185.0, 'Weekly', '2025-01-06 00:00:00', '2025-01-13 00:00:00', 'paused', 'Recurring Transfer Checking to Savings (Weekly)'),
(2, 1, 316.97, 'Weekly', '2025-01-18 00:00:00', '2025-02-07 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Weekly)'),
(1, 2, 1751.51, 'Monthly', '2025-02-15 00:00:00', '2025-02-27 00:00:00', 'paused', 'Recurring Transfer Checking to Savings (Monthly)'),
(1, 2, 1586.13, 'Monthly', '2025-01-16 00:00:00', '2025-01-30 00:00:00', 'paused', 'Recurring Transfer Checking to Savings (Monthly)'),
(2, 1, 178.31, 'Weekly', '2025-03-19 00:00:00', '2025-04-06 00:00:00', 'paused', 'Recurring Transfer Savings to Checking (Weekly)'),
(2, 1, 1545.44, 'Weekly', '2025-01-15 00:00:00', '2025-01-23 00:00:00', 'paused', 'Recurring Transfer Savings to Checking (Weekly)'),
(2, 1, 447.67, 'Monthly', '2025-02-27 00:00:00', '2025-03-06 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Monthly)'),
(1, 2, 978.49, 'Weekly', '2025-01-10 00:00:00', '2025-01-25 00:00:00', 'active', 'Recurring Transfer Checking to Savings (Weekly)'),
(2, 1, 1672.74, 'Weekly', '2025-03-27 00:00:00', '2025-04-15 00:00:00', 'paused', 'Recurring Transfer Savings to Checking (Weekly)'),
(2, 1, 1807.78, 'Monthly', '2025-01-02 00:00:00', '2025-01-09 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Monthly)'),
(2, 1, 1003.19, 'Weekly', '2025-01-05 00:00:00', '2025-01-13 00:00:00', 'active', 'Recurring Transfer Savings to Checking (Weekly)');






























































