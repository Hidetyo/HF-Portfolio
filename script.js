// script.js (ポートフォリオサイト向け - タブ機能の不具合修正 再試行版)

// ... (initializePagePortfolio, redirectToLangVersionPortfolio, switchLang 関数は変更なし) ...
function initializePagePortfolio() {
    const supportedLangs = ['ja', 'en'];
    let preferredLang = localStorage.getItem("HFPortfolio_lang"); // サイト固有のキー
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    let detectedLangInFile = null;
    if (currentFile.includes('_ja.html')) {
        detectedLangInFile = 'ja';
    } else if (currentFile.includes('_en.html')) {
        detectedLangInFile = 'en';
    }

    if (!preferredLang) {
        const browserLang = (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language || window.navigator.userLanguage;
        const primaryBrowserLang = browserLang.substring(0, 2).toLowerCase();
        if (supportedLangs.includes(primaryBrowserLang)) {
            preferredLang = primaryBrowserLang;
        } else {
            preferredLang = 'ja'; // デフォルト言語
        }
        localStorage.setItem("HFPortfolio_lang", preferredLang);
    }

    if (detectedLangInFile && detectedLangInFile !== preferredLang && supportedLangs.includes(preferredLang)) {
        redirectToLangVersionPortfolio(preferredLang, currentFile);
        return;
    }

    document.body.style.visibility = "visible";

    if (typeof openTab === 'function' && (currentFile.startsWith('works_ja') || currentFile.startsWith('works_en'))) {
        const defaultActiveButton = document.querySelector('.tablinks.active') || document.querySelector('.tab .tablinks');
        if (defaultActiveButton) {
            let initialTab = 'all_recommended';
            const onclickAttr = defaultActiveButton.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/openTab\('([^']+)'/);
                if (match && match[1]) {
                    initialTab = match[1];
                }
            }
            openTab(initialTab, defaultActiveButton);
        }
    }
}

function redirectToLangVersionPortfolio(lang, currentFilename) {
    localStorage.setItem("HFPortfolio_lang", lang);
    let baseName = "";
    const jaSuffix = '_ja.html';
    const enSuffix = '_en.html';

    if (currentFilename.endsWith(jaSuffix)) {
        baseName = currentFilename.substring(0, currentFilename.length - jaSuffix.length);
    } else if (currentFilename.endsWith(enSuffix)) {
        baseName = currentFilename.substring(0, currentFilename.length - enSuffix.length);
    } else if (currentFilename.endsWith('.html')) {
        baseName = currentFilename.substring(0, currentFilename.length - '.html'.length);
    } else if (currentFilename === "" || currentFilename === "index") {
        baseName = "index";
    } else {
        baseName = currentFilename;
    }
    if (baseName === "") baseName = "index";

    const newPage = `${baseName}_${lang}.html`;
    let currentPath = window.location.pathname;
    let newPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) + newPage;
    let queryString = window.location.search;
    let hashString = window.location.hash;

    const currentRelativePath = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (currentRelativePath !== newPage ||
        window.location.search !== queryString ||
        window.location.hash !== hashString) {
        window.location.href = newPath + queryString + hashString;
    }
}

function switchLang(lang) {
    const currentFile = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
    redirectToLangVersionPortfolio(lang, currentFile);
}

/**
 * タブ切り替え関数 (worksページで使用) - 不具合修正 再試行版
 * @param {string} tabName - 表示するタブ名 ('all_recommended', 'all_chronological', 'research', 'hobby')
 * @param {HTMLElement} elmnt - クリックされたタブボタン要素
 */
function openTab(tabName, elmnt) {
    const allWorkItemContainers = Array.from(document.querySelectorAll('#works-list-items-container > .work-item-container'));
    const tablinks = document.querySelectorAll(".tablinks");
    const worksListContainer = document.getElementById('works-list-items-container');

    if (!worksListContainer) {
        // console.error("Works list container (#works-list-items-container) not found!");
        return;
    }

    // 1. タブボタンのアクティブ状態を更新
    tablinks.forEach(tablink => tablink.classList.remove("active"));
    if (elmnt) {
        elmnt.classList.add("active");
    }

    // 2. すべての実績アイテムを一旦非表示にする (DOMからは削除しない)
    allWorkItemContainers.forEach(item => {
        item.style.display = 'none';
    });

    // 3. 表示すべきアイテムをフィルタリング
    let itemsToDisplay;
    if (tabName === 'all_recommended' || tabName === 'all_chronological') {
        itemsToDisplay = [...allWorkItemContainers]; // 全てのアイテムを対象
    } else { // 'research' または 'hobby'
        itemsToDisplay = allWorkItemContainers.filter(item => item.classList.contains(tabName));
    }

    // 4. フィルタリングされたアイテムをソート
    //    ソートは表示するアイテムの「順序」を変えるため、DOM操作が必要
    if (tabName === 'all_recommended') {
        itemsToDisplay.sort((a, b) => {
            const orderA = parseInt(a.dataset.recommendOrder) || Infinity;
            const orderB = parseInt(b.dataset.recommendOrder) || Infinity;
            if (orderA === orderB) {
                const dateA = new Date(a.dataset.publishDate || 0);
                const dateB = new Date(b.dataset.publishDate || 0);
                return dateB - dateA;
            }
            return orderA - orderB;
        });
    } else if (tabName === 'all_chronological' || tabName === 'research' || tabName === 'hobby') {
        itemsToDisplay.sort((a, b) => {
            const dateA = new Date(a.dataset.publishDate || 0);
            const dateB = new Date(b.dataset.publishDate || 0);
            return dateB - dateA; // 新しいものが上
        });
    }

    // 5. DOM操作: ソートされた順にアイテムをコンテナに追加し直し、表示する
    //    (worksListContainer の子要素として正しい順序で並ぶようにする)
    if (itemsToDisplay.length > 0) {
        itemsToDisplay.forEach(item => {
            worksListContainer.appendChild(item); // これでDOM内の順序も変わる
            item.style.display = 'block'; // またはCSSで定義された .work-item-container の表示形式
        });
    } else {
        // 表示するアイテムがない場合の処理 (例: 「該当する実績はありません」メッセージ)
        // worksListContainer.innerHTML = '<p style="text-align:center; width:100%;">該当する実績はありません。</p>';
    }
}

window.onload = function () {
    initializePagePortfolio();
};