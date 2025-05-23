// script.js (ポートフォリオサイト向け - タブ機能修正版)

/**
 * ページの初期化処理。
 */
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

    // localStorageに言語設定がない場合、ブラウザ言語から推定し保存
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

    // 表示中のページの言語と優先言語が異なり、かつリダイレクトループを避けるためにファイル名が明確な場合のみリダイレクト
    if (detectedLangInFile && detectedLangInFile !== preferredLang && supportedLangs.includes(preferredLang)) {
        redirectToLangVersionPortfolio(preferredLang, currentFile);
        return; // リダイレクトするので以降の処理は中断
    }

    document.body.style.visibility = "visible";

    // worksページの場合、デフォルトで「全て（おすすめ順）」タブを開く
    if (typeof openTab === 'function' && (currentFile.startsWith('works_ja') || currentFile.startsWith('works_en'))) {
        const defaultActiveButton = document.querySelector('.tablinks.active') || document.querySelector('.tab .tablinks'); // 最初のタブボタンを取得
        if (defaultActiveButton) {
            let initialTab = 'all_recommended'; // デフォルトはおすすめ順
            const onclickAttr = defaultActiveButton.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/openTab\('([^']+)'/);
                if (match && match[1]) {
                    initialTab = match[1]; // onclick属性からタブ名を取得
                }
            }
            openTab(initialTab, defaultActiveButton);
        }
    }
}

/**
 * 指定された言語バージョンの適切なHTMLファイルにリダイレクトする。
 */
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
    } else if (currentFilename === "" || currentFilename === "index") { // index や index.html の場合
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

    // 現在のページがリダイレクト先のページと完全に同じ（クエリやハッシュも含め）でない場合のみリダイレクト
    const currentRelativePath = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (currentRelativePath !== newPage ||
        window.location.search !== queryString ||
        window.location.hash !== hashString) {
        window.location.href = newPath + queryString + hashString;
    }
}

/**
 * 言語切り替えボタンから呼び出される関数。
 */
function switchLang(lang) {
    const currentFile = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
    redirectToLangVersionPortfolio(lang, currentFile);
}

/**
 * タブ切り替え関数 (worksページで使用)
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

    // タブボタンのアクティブ状態を更新
    tablinks.forEach(tablink => tablink.classList.remove("active"));
    if (elmnt) {
        elmnt.classList.add("active");
    }

    // 表示すべきアイテムをフィルタリング
    let filteredItems = [];
    if (tabName === 'all_recommended' || tabName === 'all_chronological') {
        filteredItems = [...allWorkItemContainers];
    } else {
        filteredItems = allWorkItemContainers.filter(item => item.classList.contains(tabName));
    }

    // フィルタリングされたアイテムをソート
    let sortedItems = [...filteredItems];

    if (tabName === 'all_recommended') {
        sortedItems.sort((a, b) => {
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
        sortedItems.sort((a, b) => {
            const dateA = new Date(a.dataset.publishDate || 0);
            const dateB = new Date(b.dataset.publishDate || 0);
            return dateB - dateA;
        });
    }

    // DOM操作:
    while (worksListContainer.firstChild) {
        worksListContainer.removeChild(worksListContainer.firstChild);
    }

    if (sortedItems.length > 0) {
        sortedItems.forEach(item => {
            worksListContainer.appendChild(item);
            item.style.display = 'block'; // CSSでの .work-item-container の display に合わせる
        });
    } else {
        // worksListContainer.innerHTML = '<p style="text-align:center; width:100%;">該当する実績はありません。</p>';
    }
}

window.onload = function () {
    initializePagePortfolio();
};