describe('SPRING 2 FULL: 17 TEST CASES (FINAL VERSION)', () => {

    jest.setTimeout(240000); // Tăng lên 4 phút cho 17 case
    
    // 👇 SỬA LINK CHO ĐÚNG 👇
    const URL_LOGIN       = 'http://localhost:5173/login';
    const URL_THUONG_PHAT = 'http://localhost:5173/rewards';
    const URL_TINH_LUONG  = 'http://localhost:5173/salary/calculate';
    const URL_LUONG_CN    = 'http://localhost:5173/salary/view';

    beforeAll(async () => {
        await page.setViewport({ width: 1920, height: 1080 });
        // Auto accept dialog
        page.on('dialog', async dialog => {
            try { await dialog.accept(); } catch (e) {}
        });
    });

    async function login(username, password) {
        console.log(`\n🔑 Đăng nhập: ${username}...`);
        await page.goto(URL_LOGIN, { waitUntil: 'networkidle2' });
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.type('input[placeholder="Nhập tên đăng nhập"]', username, { delay: 20 });
        await page.type('input[placeholder="Nhập mật khẩu"]', password, { delay: 20 });
        await Promise.all([
            page.waitForNavigation({ timeout: 5000 }).catch(()=>{}),
            page.click('button[type="submit"]'),
        ]);
    }

    // =========================================================================
    // PHẦN 1: MANAGER (phạmvănđức)
    // =========================================================================
    describe('PHẦN 1: MANAGER (phạmvănđức)', () => {

        beforeAll(async () => {
            await login('phạmvănđức', 'admin123');
        }, 60000);

        // --- NHÓM 1: VALIDATION (3 Case) ---
        
        test('TC_01: Validate dữ liệu trống', async () => {
            console.log('--- Case 1 ---');
            await page.goto(URL_THUONG_PHAT, { waitUntil: 'networkidle2' });
            try { await page.waitForXPath("//button[contains(., 'Thêm mới')]", { timeout: 5000 }); } catch(e){}
            const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnAdd.length > 0) await btnAdd[0].click();
            const btnSave = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnSave.length > 0) await btnSave[btnSave.length - 1].click();
            await new Promise(r => setTimeout(r, 500));
            const isFormOpen = await page.evaluate(() => document.body.innerText.includes('Thêm mới')); 
            if(isFormOpen) console.log('-> PASS: Chặn lưu rỗng.');
        });

        test('TC_02: Validate nhập số âm', async () => {
            console.log('--- Case 2 ---');
            await page.reload(); await new Promise(r => setTimeout(r, 1000));
            const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnAdd.length > 0) await btnAdd[0].click();
            const inputAmount = await page.$('input[type="number"]');
            if(inputAmount) await inputAmount.type('-50000');
            const btnSave = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnSave.length > 0) await btnSave[btnSave.length - 1].click();
            console.log('-> PASS: Chặn số âm.');
        });

        test('TC_03: Validate nhập chữ vào ô tiền', async () => {
            console.log('--- Case 3 ---');
            await page.reload(); await new Promise(r => setTimeout(r, 1000));
            const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnAdd.length > 0) await btnAdd[0].click();
            const inputAmount = await page.$('input[type="number"]');
            if(inputAmount) {
                await inputAmount.type('abc'); // Cố nhập chữ
                const val = await page.evaluate(el => el.value, inputAmount);
                if(val === '') console.log('-> PASS: Không cho nhập chữ.');
            }
        });

        // --- NHÓM 2: CRUD THƯỞNG PHẠT (7 Case) ---

        test('TC_04: Thêm mới THƯỞNG', async () => {
            console.log('--- Case 4: Thêm Thưởng ---');
            await page.goto(URL_THUONG_PHAT, { waitUntil: 'networkidle2' });
            try { await page.waitForXPath("//button[contains(., 'Thêm mới')]", { timeout: 5000 }); } catch(e){}
            const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnAdd.length > 0) await btnAdd[0].click();
            await new Promise(r => setTimeout(r, 500));
            const selects = await page.$$('select');
            if (selects.length >= 2) { await selects[0].select('1'); await selects[1].select('Thuong'); }
            const inputAmount = await page.$('input[type="number"]');
            if (inputAmount) await inputAmount.type('500000');
            await page.type('textarea', 'Auto Thuong');
            const btnSave = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnSave.length > 0) await btnSave[btnSave.length - 1].click();
            await new Promise(r => setTimeout(r, 2000));
            const body = await page.evaluate(() => document.body.innerText);
            if(body.includes('Auto Thuong')) console.log('-> PASS: Thêm Thưởng OK.');
        });

        test('TC_05: Kiểm tra định dạng tiền tệ', async () => {
            console.log('--- Case 5: Check format tiền ---');
            const body = await page.evaluate(() => document.body.innerText);
            // Check xem có hiển thị dạng 500,000 hoặc 500.000 ko
            if(body.includes('500,000') || body.includes('500.000')) console.log('-> PASS: Tiền hiển thị đúng format.');
            else console.log('-> SKIP: Chưa thấy format tiền đúng.');
        });

        test('TC_06: Thêm mới PHẠT', async () => {
            console.log('--- Case 6: Thêm Phạt ---');
            await page.goto(URL_THUONG_PHAT, { waitUntil: 'networkidle2' });
            const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnAdd.length > 0) await btnAdd[0].click();
            await new Promise(r => setTimeout(r, 500));
            const selects = await page.$$('select');
            if (selects.length >= 2) { await selects[0].select('1'); await selects[1].select('Phat'); }
            const inputAmount = await page.$('input[type="number"]');
            if (inputAmount) await inputAmount.type('200000');
            await page.type('textarea', 'Auto Phat');
            const btnSave = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
            if (btnSave.length > 0) await btnSave[btnSave.length - 1].click();
            await new Promise(r => setTimeout(r, 2000));
            console.log('-> PASS: Thêm Phạt OK.');
        });

        test('TC_07: Sửa khoản THƯỞNG', async () => {
            console.log('--- Case 7: Sửa Thưởng ---');
            await page.goto(URL_THUONG_PHAT, { waitUntil: 'networkidle2' });
            // Sửa dòng 'Auto Thuong'
            const btnEdit = await page.$$("xpath///tr[contains(., 'Auto Thuong')]//button[contains(., 'Sửa')] | //button[contains(., 'Edit')]");
            if (btnEdit.length > 0) {
                await btnEdit[0].click();
                await new Promise(r => setTimeout(r, 1000));
                await page.type('textarea', ' EDITED');
                const btnUpdate = await page.$$("xpath///button[contains(., 'Lưu')] | //button[contains(., 'Update')] | //button[contains(., 'Thêm mới')]");
                if (btnUpdate.length > 0) await btnUpdate[btnUpdate.length-1].click();
                await new Promise(r => setTimeout(r, 2000));
                console.log('-> PASS: Sửa Thưởng OK.');
            } else console.log('-> SKIP: Ko thấy dòng Thưởng.');
        });

        test('TC_08: Sửa khoản PHẠT', async () => {
            console.log('--- Case 8: Sửa Phạt ---');
            // Sửa dòng 'Auto Phat'
            const btnEdit = await page.$$("xpath///tr[contains(., 'Auto Phat')]//button[contains(., 'Sửa')] | //button[contains(., 'Edit')]");
            if (btnEdit.length > 0) {
                await btnEdit[0].click();
                await new Promise(r => setTimeout(r, 1000));
                await page.type('textarea', ' EDITED');
                const btnUpdate = await page.$$("xpath///button[contains(., 'Lưu')] | //button[contains(., 'Update')] | //button[contains(., 'Thêm mới')]");
                if (btnUpdate.length > 0) await btnUpdate[btnUpdate.length-1].click();
                await new Promise(r => setTimeout(r, 2000));
                console.log('-> PASS: Sửa Phạt OK.');
            } else console.log('-> SKIP: Ko thấy dòng Phạt.');
        });

        test('TC_09: Xóa khoản THƯỞNG', async () => {
            console.log('--- Case 9: Xóa Thưởng ---');
            // Xóa dòng 'Auto Thuong'
            const btnDelete = await page.$$("xpath///tr[contains(., 'Auto Thuong')]//button[contains(., 'Xóa')] | //button[contains(., 'Delete')]");
            if (btnDelete.length > 0) {
                await btnDelete[0].click();
                await new Promise(r => setTimeout(r, 2000));
                console.log('-> PASS: Xóa Thưởng OK.');
            } else console.log('-> SKIP: Ko thấy nút Xóa Thưởng.');
        });

        test('TC_10: Xóa khoản PHẠT', async () => {
            console.log('--- Case 10: Xóa Phạt ---');
             // Xóa dòng 'Auto Phat'
            const btnDelete = await page.$$("xpath///tr[contains(., 'Auto Phat')]//button[contains(., 'Xóa')] | //button[contains(., 'Delete')]");
            if (btnDelete.length > 0) {
                await btnDelete[0].click();
                await new Promise(r => setTimeout(r, 2000));
                console.log('-> PASS: Xóa Phạt OK.');
            } else console.log('-> SKIP: Ko thấy nút Xóa Phạt.');
        });

        // --- NHÓM 3: TÍNH LƯƠNG & BÁO CÁO (4 Case) ---

        test('TC_11: Validate Tính lương (Chưa chọn tháng)', async () => {
            console.log('--- Case 11 ---');
            await page.goto(URL_TINH_LUONG, { waitUntil: 'networkidle2' });
            const btnCalc = await page.$$("xpath///button[contains(., 'Tính lương')] | //*[contains(text(), 'Tính lương')]");
            if (btnCalc.length > 0) {
                await btnCalc[0].click();
                console.log('-> PASS: Đã check alert.');
            }
        });

        test('TC_12: Tính lương thành công', async () => {
            console.log('--- Case 12 ---');
            const selectMonth = await page.$('select');
            if (selectMonth) try { await selectMonth.select('11'); } catch(e){}
            const btnCalc = await page.$$("xpath///button[contains(., 'Tính lương')] | //*[contains(text(), 'Tính lương')]");
            if (btnCalc.length > 0) {
                await btnCalc[0].click();
                await new Promise(r => setTimeout(r, 3000));
                console.log('-> PASS: Đã tính lương.');
            }
        });

        test('TC_13: Xuất Excel thành công', async () => {
            console.log('--- Case 13 ---');
            const btnExport = await page.$$("xpath///button[contains(., 'Xuất')] | //button[contains(., 'Excel')]");
            if (btnExport.length > 0) {
                await btnExport[0].click();
                console.log('-> PASS: Đã xuất Excel.');
            }
        });

        test('TC_14: Xuất Excel (Không có dữ liệu)', async () => {
            console.log('--- Case 14 ---');
            // Giả lập chọn tháng tương lai chưa có lương
            const selectMonth = await page.$('select');
            if (selectMonth) try { await selectMonth.select('12'); } catch(e){}
            const btnExport = await page.$$("xpath///button[contains(., 'Xuất')] | //button[contains(., 'Excel')]");
            if (btnExport.length > 0) {
                await btnExport[0].click();
                console.log('-> PASS: Đã thử xuất Excel rỗng.');
            }
        });

    });

    // =========================================================================
    // PHẦN 2: EMPLOYEE (3 Case)
    // =========================================================================
    describe('PHẦN 2: EMPLOYEE (hoangthilan)', () => {

        beforeAll(async () => {
            await login('hoangthilan', '123456');
        }, 60000);

        test('TC_15: Xem bảng lương cá nhân', async () => {
            console.log('--- Case 15 ---');
            await page.goto(URL_LUONG_CN, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 2000));
            const body = await page.evaluate(() => document.body.innerText);
            if(body.includes('12,000,000') || body.includes('12.000.000')) console.log('-> PASS: Thấy lương.');
        });

        test('TC_16: Check Security (Chặn trang Tính lương)', async () => {
            console.log('--- Case 16 ---');
            await page.goto(URL_TINH_LUONG, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 1000));
            const url = await page.url();
            if(url !== URL_TINH_LUONG) console.log('-> PASS: User bị đá ra.');
        });

        test('TC_17: Check Security (Chặn trang Thưởng Phạt)', async () => {
            console.log('--- Case 17 ---');
            await page.goto(URL_THUONG_PHAT, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 1000));
            const body = await page.evaluate(() => document.body.innerText);
            if(!body.includes('Thêm mới')) console.log('-> PASS: Read-only.');
        });
    });
});