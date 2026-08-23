const dashboardData = {
    "dtc": {
        "title": "DTC (Direct-to-Consumer) 垂直電商品牌",
        "concept": "建立自有獨立站，直接將設計款服飾銷售給終端消費者（排球愛好者）。主打具備強烈視覺風格的單品，直接面對終端消費者。",
        "target_audience": "注重球場穿搭、喜歡展現個人風格的年輕排球族群。",
        "revenue": "單件服飾的零售利潤。",
        "pros": [
            "利潤空間最大，完全掌握品牌定價權。",
            "最能發揮 SEO 與 GA4 專長，透過內容行銷吸引自然流量，並利用數據優化轉換率。"
        ],
        "cons": [
            "初期需要投入建立品牌信任度，且有庫存囤積的風險。"
        ],
        "todos": [
            {
                "id": "dtc-1",
                "parent": "Phase 1: 基礎建設與定位",
                "items": [
                    {
                        "id": "dtc-1-1",
                        "task": "確認首波主打產品設計 (如: 像素風限定 T-shirt)",
                        "startDate": "2026-09-01",
                        "dueDate": "2026-09-15",
                        "owner": "設計師",
                        "notes": "首波主打預計限量 100 件，需於 9/10 前確認 3 款主視覺初稿",
                        "completed": false
                    },
                    {
                        "id": "dtc-1-2",
                        "task": "尋找成衣代工廠並確認 MOQ 與交期",
                        "startDate": "2026-09-10",
                        "dueDate": "2026-09-25",
                        "owner": "供應鏈窗口",
                        "notes": "目標 MOQ < 50 件，優先評估具備機能排汗布料打樣經驗之廠商",
                        "completed": false
                    },
                    {
                        "id": "dtc-1-3",
                        "task": "訂定詳細的尺寸對照表 (含試穿員數據)",
                        "startDate": "2026-09-20",
                        "dueDate": "2026-09-30",
                        "owner": "產品PM",
                        "notes": "邀請 5 位不同身高的排球選手進行實際試穿評測",
                        "completed": false
                    }
                ]
            },
            {
                "id": "dtc-2",
                "parent": "Phase 2: 平台建置",
                "items": [
                    {
                        "id": "dtc-2-1",
                        "task": "建立 Shopify / WooCommerce 輕量化獨立站",
                        "startDate": "2026-10-01",
                        "dueDate": "2026-10-20",
                        "owner": "工程師",
                        "completed": false
                    },
                    {
                        "id": "dtc-2-2",
                        "task": "完成第三方金流與物流 API 串接",
                        "startDate": "2026-10-15",
                        "dueDate": "2026-10-31",
                        "owner": "工程師",
                        "completed": false
                    },
                    {
                        "id": "dtc-2-3",
                        "task": "安裝並設定 GA4 及 Search Console",
                        "startDate": "2026-10-25",
                        "dueDate": "2026-11-05",
                        "owner": "行銷專家",
                        "completed": false
                    }
                ]
            },
            {
                "id": "dtc-3",
                "parent": "Phase 3: 行銷與發售",
                "items": [
                    {
                        "id": "dtc-3-1",
                        "task": "拍攝高質感實穿照與情境照",
                        "startDate": "2026-11-01",
                        "dueDate": "2026-11-15",
                        "owner": "視覺統籌",
                        "completed": false
                    },
                    {
                        "id": "dtc-3-2",
                        "task": "撰寫首批 SEO 內容 (排球人專屬穿搭指南)",
                        "startDate": "2026-11-10",
                        "dueDate": "2026-11-25",
                        "owner": "內容企劃",
                        "completed": false
                    },
                    {
                        "id": "dtc-3-3",
                        "task": "啟動「預購發售制 (Drop System)」行銷預熱",
                        "startDate": "2026-11-20",
                        "dueDate": "2026-12-10",
                        "owner": "行銷專家",
                        "completed": false
                    }
                ]
            }
        ]
    },
    "b2b": {
        "title": "在地球隊與聯賽客製化 (B2B 團服)",
        "concept": "鎖定各大學系隊、社會組球隊、或是地方聯賽，提供具備高度設計感的隊服客製化服務。以大批量訂單確保穩定的初期現金流。",
        "target_audience": "大學排球系隊/校隊、社會組聯賽隊伍、排球社團。",
        "revenue": "大批量的團體訂單（通常為 10-20 件起跳）。",
        "pros": [
            "訂單量大，現金流穩定。",
            "這是一個「活廣告」，當一支球隊穿著你們設計的球衣比賽時，會自然吸引其他球隊詢問。"
        ],
        "cons": [
            "毛利較低（團服通常需要折扣）。",
            "溝通成本極高（需來回確認背號、尺寸、贊助商 Logo 等）。"
        ],
        "todos": [
            {
                "id": "b2b-1",
                "parent": "Phase 1: 產品與供應鏈",
                "items": [
                    {
                        "id": "b2b-1-1",
                        "task": "設計 3-5 款極具辨識度的「半客製化」公版球衣模板",
                        "startDate": "2026-09-01",
                        "dueDate": "2026-09-20",
                        "owner": "設計師",
                        "completed": false
                    },
                    {
                        "id": "b2b-1-2",
                        "task": "尋找熱昇華技術穩定且不易掉色的在地成衣廠",
                        "startDate": "2026-09-10",
                        "dueDate": "2026-09-30",
                        "owner": "供應鏈窗口",
                        "completed": false
                    },
                    {
                        "id": "b2b-1-3",
                        "task": "制定嚴格的設計修改規範與報價單 (限二次免費修改)",
                        "startDate": "2026-09-25",
                        "dueDate": "2026-10-10",
                        "owner": "商務營運",
                        "completed": false
                    }
                ]
            },
            {
                "id": "b2b-2",
                "parent": "Phase 2: 業務拓點與合約",
                "items": [
                    {
                        "id": "b2b-2-1",
                        "task": "明訂收款財務紀律 (50% 訂金，尾款付清交貨)",
                        "startDate": "2026-10-01",
                        "dueDate": "2026-10-15",
                        "owner": "財務負責人",
                        "completed": false
                    },
                    {
                        "id": "b2b-2-2",
                        "task": "列出熱門社會組球隊及大專盃賽事清單",
                        "startDate": "2026-10-10",
                        "dueDate": "2026-10-25",
                        "owner": "業務開發",
                        "completed": false
                    },
                    {
                        "id": "b2b-2-3",
                        "task": "製作 B2B 線上快速詢價表單",
                        "startDate": "2026-10-20",
                        "dueDate": "2026-11-05",
                        "owner": "工程師",
                        "completed": false
                    }
                ]
            },
            {
                "id": "b2b-3",
                "parent": "Phase 3: 贊助與口碑行銷",
                "items": [
                    {
                        "id": "b2b-3-1",
                        "task": "挑選 1-2 支指標性球隊洽談贊助合作",
                        "startDate": "2026-11-01",
                        "dueDate": "2026-11-20",
                        "owner": "商務營運",
                        "completed": false
                    },
                    {
                        "id": "b2b-3-2",
                        "task": "針對地區性關鍵字進行 SEO 優化 (如: 台北排球隊服)",
                        "startDate": "2026-11-15",
                        "dueDate": "2026-11-30",
                        "owner": "行銷專家",
                        "completed": false
                    }
                ]
            }
        ]
    },
    "pod": {
        "title": "Print-on-Demand (POD) 隨選列印模式",
        "concept": "與第三方印刷廠或供應鏈合作，消費者在網頁下單後，才由工廠直接印製並出貨。作為極低風險的市場水溫測試機。",
        "target_audience": "喜歡特定圖樣設計（而非機能性布料）的排球文化愛好者。",
        "revenue": "扣除工廠製作與物流成本後的利潤。",
        "pros": [
            "零庫存風險，初期資金壓力極小，適合測試市場水溫。",
            "可以快速上架多種設計概念，透過數據測試受眾喜好。"
        ],
        "cons": [
            "對產品品質與出貨時間掌控度較低。",
            "單件利潤最薄，材質受限於廠商選項。"
        ],
        "todos": [
            {
                "id": "pod-1",
                "parent": "Phase 1: 供應商評估與串接",
                "items": [
                    {
                        "id": "pod-1-1",
                        "task": "評估並選擇合適的 POD 服務商 (如 Printify, Printful)",
                        "startDate": "2026-09-05",
                        "dueDate": "2026-09-20",
                        "owner": "產品PM",
                        "completed": false
                    },
                    {
                        "id": "pod-1-2",
                        "task": "完成電商平台與 POD 供應商的 API 串接",
                        "startDate": "2026-09-20",
                        "dueDate": "2026-10-05",
                        "owner": "工程師",
                        "completed": false
                    },
                    {
                        "id": "pod-1-3",
                        "task": "自費下單進行品質與物流時間測試",
                        "startDate": "2026-10-01",
                        "dueDate": "2026-10-18",
                        "owner": "QA窗口",
                        "completed": false
                    }
                ]
            },
            {
                "id": "pod-2",
                "parent": "Phase 2: 設計與迭代",
                "items": [
                    {
                        "id": "pod-2-1",
                        "task": "產出首波 3-5 款不同風格的測試圖樣",
                        "startDate": "2026-10-15",
                        "dueDate": "2026-11-05",
                        "owner": "設計師",
                        "completed": false
                    },
                    {
                        "id": "pod-2-2",
                        "task": "上架商品並設計有吸引力的 Mockup",
                        "startDate": "2026-11-01",
                        "dueDate": "2026-11-15",
                        "owner": "視覺統籌",
                        "completed": false
                    },
                    {
                        "id": "pod-2-3",
                        "task": "建立自動化拋單流程確保無縫營運",
                        "startDate": "2026-11-10",
                        "dueDate": "2026-11-25",
                        "owner": "工程師",
                        "completed": false
                    }
                ]
            },
            {
                "id": "pod-3",
                "parent": "Phase 3: 流量與數據分析",
                "items": [
                    {
                        "id": "pod-3-1",
                        "task": "鎖定長尾關鍵字導入低成本測試流量",
                        "startDate": "2026-11-20",
                        "dueDate": "2026-12-05",
                        "owner": "行銷專家",
                        "completed": false
                    },
                    {
                        "id": "pod-3-2",
                        "task": "透過 GA4 數據追蹤各款式轉換率",
                        "startDate": "2026-12-01",
                        "dueDate": "2026-12-20",
                        "owner": "數據分析師",
                        "completed": false
                    },
                    {
                        "id": "pod-3-3",
                        "task": "篩選明星設計款，評估轉為自行量產的可行性",
                        "startDate": "2026-12-15",
                        "dueDate": "2026-12-31",
                        "owner": "Founder",
                        "completed": false
                    }
                ]
            }
        ]
    },
    "lifestyle": {
        "title": "排球生活風格跨界品牌",
        "concept": "不只做打球穿的衣服，而是做排球人日常穿的衣服。將排球元素融入街頭服飾，打入日常穿搭，做排球人的 Lifestyle。",
        "target_audience": "有排球背景，但希望在日常生活中也能展現排球身份的消費者。",
        "revenue": "休閒服飾、配件（如帽子、運動毛巾、多功能運動包）零售。",
        "pros": [
            "突破了只有上場打球才會穿的限制，大大擴增了市場規模 (TAM)。",
            "設計發揮空間更大，能運用高磅數棉 T 或外套。"
        ],
        "cons": [
            "競爭對手是廣大的流行服飾品牌。",
            "品類越多，庫存與資金壓力越大。"
        ],
        "todos": [
            {
                "id": "life-1",
                "parent": "Phase 1: 品牌定調與品類開發",
                "items": [
                    {
                        "id": "life-1-1",
                        "task": "確立隱晦且具設計感的排球文化視覺語彙",
                        "startDate": "2026-09-15",
                        "dueDate": "2026-10-05",
                        "owner": "設計總監",
                        "completed": false
                    },
                    {
                        "id": "life-1-2",
                        "task": "開發核心品類：高磅數純棉 T-shirt 與老帽",
                        "startDate": "2026-10-01",
                        "dueDate": "2026-10-25",
                        "owner": "產品PM",
                        "completed": false
                    },
                    {
                        "id": "life-1-3",
                        "task": "尋找適合休閒服飾的成衣代工廠並控管成本",
                        "startDate": "2026-10-20",
                        "dueDate": "2026-11-10",
                        "owner": "供應鏈窗口",
                        "completed": false
                    }
                ]
            },
            {
                "id": "life-2",
                "parent": "Phase 2: 社群文化建立",
                "items": [
                    {
                        "id": "life-2-1",
                        "task": "企劃排球員的場外生活品味專題內容",
                        "startDate": "2026-11-01",
                        "dueDate": "2026-11-20",
                        "owner": "內容企劃",
                        "completed": false
                    },
                    {
                        "id": "life-2-2",
                        "task": "篩選具備 Lifestyle 特質的排球 KOL 名單",
                        "startDate": "2026-11-15",
                        "dueDate": "2026-11-30",
                        "owner": "公關窗口",
                        "completed": false
                    },
                    {
                        "id": "life-2-3",
                        "task": "寄發公關品進行社群 Seeding",
                        "startDate": "2026-12-01",
                        "dueDate": "2026-12-20",
                        "owner": "行銷專家",
                        "completed": false
                    }
                ]
            },
            {
                "id": "life-3",
                "parent": "Phase 3: 擴大打擊面",
                "items": [
                    {
                        "id": "life-3-1",
                        "task": "針對『運動休閒風』等廣泛意圖進行 SEO",
                        "startDate": "2026-12-10",
                        "dueDate": "2027-01-05",
                        "owner": "SEO專家",
                        "completed": false
                    },
                    {
                        "id": "life-3-2",
                        "task": "建立會員點數或 Retargeting 再行銷系統",
                        "startDate": "2026-12-20",
                        "dueDate": "2027-01-15",
                        "owner": "工程師",
                        "completed": false
                    }
                ]
            }
        ]
    },
    "global_data": {
        "decisions": [
            {
                "date": "2026-08-20",
                "topic": "選擇 MVP 模式",
                "decision": "先以 B2B 團服客製化作為初期核心，確保現金流。",
                "owner": "Founder"
            }
        ],
        "budget": [
            {
                "item": "初期打版與打樣費",
                "estimated_cost": "20,000",
                "notes": "3 款公版球衣"
            },
            {
                "item": "網站與網域建置",
                "estimated_cost": "3,000",
                "notes": "一年期網域與基本主機"
            }
        ]
    }
};

// 讓瀏覽器可以直接載入這個檔案並將資料掛在 window 物件下
window.dashboardData = dashboardData;