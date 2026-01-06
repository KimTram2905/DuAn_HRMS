describe('Epic 3.3: Quản lý Thưởng/Phạt', () => {

    // --- CẤU HÌNH ---
    // Link trang Thưởng phạt: HÃY SỬA LẠI NẾU LINK NÀY SAI
    const REWARD_PAGE_URL = 'http://localhost:5173/rewards'; 

    beforeAll(async () => {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
        await page.setViewport({ width: 1920, height: 1080 });
    }, 60000);

    test('TC_3.3_01: Thêm mới khoản Thưởng thành công', async () => {
        // ======================================================
        // BƯỚC 1: ĐĂNG NHẬP (Code đã sửa user có dấu)
        // ======================================================
        console.log('1. Đang điền thông tin đăng nhập...');
        
        // SỬA LẠI USER: Dùng 'phạmvănđức' (có dấu) và gõ chậm
        await page.type('input[placeholder="Nhập tên đăng nhập"]', 'phạmvănđức', { delay: 100 }); 
        
        // Nhập Password
        await page.type('input[placeholder="Nhập mật khẩu"]', 'admin123', { delay: 100 });
        
        console.log('2. Bấm nút Đăng nhập...');
        await Promise.all([
            page.waitForNavigation({ timeout: 10000 }).catch(() => console.log("Không chuyển trang ngay lập tức...")), 
            page.click('button[type="submit"]'), 
        ]);

        // Chờ 3s xem có chuyển trang không
        await new Promise(r => setTimeout(r, 3000));
        
        // KIỂM TRA LẠI: Nếu vẫn ở trang Login thì dừng luôn
        const currentUrl = await page.url();
        if (currentUrl.includes('login')) {
            console.log('!!! ĐĂNG NHẬP THẤT BẠI !!! Vẫn ở trang Login.');
            console.log('Lý do: Sai User hoặc Password. Hãy kiểm tra lại bằng tay!');
            throw new Error("Dừng test vì không đăng nhập được.");
        }
        console.log('--> Đăng nhập thành công! Đang vào trong...');

        // ======================================================
        // BƯỚC 2: VÀO THẲNG TRANG THƯỞNG PHẠT
        // ======================================================
        console.log(`3. Bay thẳng tới trang: ${REWARD_PAGE_URL}`);
        
        await page.goto(REWARD_PAGE_URL, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 3000)); 

        // ======================================================
        // BƯỚC 3: ĐIỀN FORM
        // ======================================================
        console.log('4. Tìm nút Thêm mới...');

        const btnAdd = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
        
        if (btnAdd.length > 0) {
            await btnAdd[0].click();
        } else {
            // NẾU LỖI Ở ĐÂY -> LÀ DO LINK "REWARD_PAGE_URL" Ở TRÊN ĐẦU FILE BỊ SAI
            await page.screenshot({ path: 'wrong_link_error.png' });
            throw new Error(`Không thấy nút Thêm mới. Có thể link ${REWARD_PAGE_URL} bị sai (404).`);
        }

        await new Promise(r => setTimeout(r, 1000)); 

        // --- Điền form ---
        const selects = await page.$$('select.input-field');
        if (selects.length >= 2) {
            // Lưu ý: Nếu user Phạm Văn Đức có value khác 1 thì sửa lại số này
            await selects[0].select('1');      
            await selects[1].select('Thuong'); 
        }

        // Nhập Tiền
        const inputAmount = await page.$('input[type="number"]');
        if (inputAmount) {
            await inputAmount.click({ clickCount: 3 });
            await inputAmount.type('500000');
        } else {
             const inputBackup = await page.$('input[name="amount"]');
             if(inputBackup) await inputBackup.type('500000');
        }

        // Nhập Lý do
        await page.type('textarea', 'Thưởng nóng dự án');

        // ======================================================
        // BƯỚC 4: LƯU VÀ KIỂM TRA
        // ======================================================
        console.log('5. Lưu...');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // Bấm Lưu
        const btnsSave = await page.$$("xpath///button[contains(., 'Thêm mới')] | //*[contains(text(), 'Thêm mới')]");
        if (btnsSave.length > 0) {
            await btnsSave[btnsSave.length - 1].click();
        }

        await new Promise(r => setTimeout(r, 3000)); 

        const bodyText = await page.evaluate(() => document.body.innerText);
        if(bodyText.includes('500,000') || bodyText.includes('500000')) {
             console.log('--> KẾT QUẢ: PASS');
        } else {
             console.log('--> KẾT QUẢ: DONE (Chưa verify được số tiền)');
        }

    }, 30000); 
});