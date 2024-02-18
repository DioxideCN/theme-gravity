// this theme has changed name from Spring Mono to Gravity
// -------------------------------------- config

cocoMessage.config({
    duration: 2000,
});

// -------------------------------------- init

let giscus = document.getElementById('comments');
// 切换主题色
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.className = themeName;
    localStorage.setItem('theme', themeName);
    // 设置Giscus主题
    if (giscus !== null) {
        giscus.setAttribute('theme', themeName === 'dark' ? giscusTheme.dark : giscusTheme.light);
    }
}
setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
// 监听切换主题
$('#theme-toggler').click(() => {
    const _theme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    setTheme(_theme);
});

$('.has-dropdown').click(function() {
    const _iNode = $(this).find('i.fa-solid').eq(0);
    if (_iNode.hasClass('fa-chevron-down')) {
        // 展开
        _iNode.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        $('.mini-bar-sub.inactive').eq(0).removeClass('inactive').addClass('active');
    } else {
        // 折叠
        _iNode.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        $('.mini-bar-sub.active').eq(0).removeClass('active').addClass('inactive');
    }
});

(function () {
    // 检索框
    $('.search-input').focus(function() { SearchWidget.open(); });

    // NavBar
    $('#mini-navbar').click(() => {
        const wrapper = $('#mini-bar-wrapper');
        const navbar = $('#mini-navbar');
        const body = $('body');
        if (wrapper.hasClass('animation-down')) {
            // 折叠
            body.removeClass('no-scroll');
            wrapper.removeClass('animation-down').addClass('animation-top');
            navbar.removeClass('fa-xmark').addClass('fa-bars');
            setTimeout(() => {
                wrapper.removeClass('animation-top');
            }, 600);
        } else {
            // 展开
            body.addClass('no-scroll');
            wrapper.addClass('animation-down');
            navbar.removeClass('fa-bars').addClass('fa-xmark');
        }
    });
})();

// -------------------------------------- upvote event

// upvote moment
const moment_localstorage_key = "gravity.likes.moment";
let likedMomentStorage = JSON.parse(localStorage.getItem(moment_localstorage_key) || "[]");
likedMomentStorage.forEach((momentName) => {
    activeUpvote(momentName);
});
function handleMomentLike(momentName) {
    handleLike(likedMomentStorage, momentName, 'moment', 'moments', moment_localstorage_key);
}
// upvote post
const post_localstorage_key = "gravity.likes.post";
let likedPostStorage = JSON.parse(localStorage.getItem(post_localstorage_key) || "[]");
likedPostStorage.forEach((postName) => {
    activeUpvote(postName);
});
function handlePostLike(postName) {
    handleLike(likedPostStorage, postName, 'content', 'posts', post_localstorage_key);
}

// abstract method
function handleLike(likedStorage, keyName, groupHead, plural, storageKey) {
    if (likedStorage.includes(keyName)) {
        cocoMessage.info("你已经点过赞了");
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/apis/api.halo.run/v1alpha1/trackers/upvote");
    xhr.onload = () => {
        likedStorage = [...likedStorage, keyName];
        localStorage.setItem(storageKey, JSON.stringify(likedStorage));
        if (plural === 'moments') {
            likedMomentStorage = likedStorage;
        } else if (plural === 'posts') {
            likedPostStorage = likedStorage;
        }
        const likesNode = document.querySelector('span[data-post-name="' + keyName + '"]');
        const likes = parseInt(likesNode.innerText);
        likesNode.innerText = likes + 1;
        activeUpvote(keyName);
    };
    xhr.onerror = function() {
        cocoMessage.error("网络连接错误");
        return;
    };
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(
        JSON.stringify({
            group: `${groupHead}.halo.run`,
            plural: plural,
            name: keyName,
        })
    );
}

function activeUpvote(metadataName) {
    var dom = document.querySelector("a[data-metadata-name='" + metadataName + "']");
    if (dom) {
        dom.classList.add("actived");
        dom.getElementsByTagName("i")[0].className = "ri-thumb-up-fill";
    }
}

// -------------------------------------- switch category posts

$(document).ready(function() {
    const pageSize = $("#post-list").data("page-size");
    $(".action-switch--category").click(function() {
        if ($(this).hasClass("actived")) return;
        // remove actived class
        $(".action-switch--category.actived").removeClass("actived");
        $(this).addClass("actived");
        // build request param
        const categoryId = $(this).data("category");
        queryPosts("/apis/api.content.halo.run/v1alpha1/" + (categoryId ? ("categories/" + categoryId + "/posts") : "posts"), { 
            page: 1, 
            size: pageSize, 
            sort: 'spec.pinned,metadata.creationTimestamp,desc',
        });
    });
    loadPagination();
    function loadPagination() {
        $("a.pagination-link[data-page-number][data-page-key='post']").click(function() {
            const page = $(this).data("page-number");
            queryPosts('/apis/api.content.halo.run/v1alpha1/posts', {
                page: page,
                size: pageSize,
                sort: 'spec.pinned,metadata.creationTimestamp,desc',
            });
        });
    }

    function queryPosts(apiUrl, params) {
        // query category request
        fetch(`${apiUrl}?${new URLSearchParams(params)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }})
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // resolve data
                let html = '';
                if (data.items.length === 0) {
                    $("#post-list").html('');
                    return;
                }
                for (const post of data.items) {
                    const publishTime = formatDateString(post.spec.publishTime);
                    let categoryHtml = '';
                    if (post.categories.length !== 0) {
                        categoryHtml = `<spam class="post_tags_devider">|</spam><i class="ri-archive-line"></i><span>${post.categories[0].spec.displayName}</span>`
                    }
                    let tagHtml = '';
                    if (post.tags.length !== 0) {
                        tagHtml += '<spam class="post_tags_devider">|</spam>';
                        for (const tag of post.tags) {
                            tagHtml += `<i class="ri-hashtag"></i><span>${tag.spec.displayName}</span>`;
                        }
                    }
                    html += `<div class="post animated fadeInDown${post.spec.pinned ? ' post-pinned' : ''}"
                        <div class="wrap">
                            <div class="post_title">
                                <h2><a class="link-green" href="${post.status.permalink}">${post.spec.title}</a></h2>
                            </div>
                            <div class="post_content markdown">${post.status.excerpt}</div>
                            <div class="post_tags">
                                <i class="ri-time-line"></i><time datetime="${publishTime}" title="${publishTime}">${publishTime}</time>
                                <spam class="post_tags_devider">|</spam>
                                <i class="ri-eye-line"></i><span>${post.stats.visit}</span>
                                <spam class="post_tags_devider">|</spam>
                                <i class="ri-thumb-up-line"></i><span>${post.stats.upvote}</span>
                                ${categoryHtml}
                                ${tagHtml}
                            </div>
                        </div>
                    </div>`;
                }
                $("#post-list").html(html + buildPagination(data.totalPages, data.page,'post'));
                loadPagination();
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    }

    // build pagination HTML
    function buildPagination(totalPages = 0, page = 1, key) {
        const items = [];
        if (page > 3) {
            items.push(`<li><a class="pagination-link" data-page-number="1" data-page-key="${key}">1</a></li>`);
            if (page !== 4) {
                items.push('<span class="space">…</span>');
            }
        }
        for (const index of generateSequence(page - 2, page + 2)) {
            if (page === index) {
                items.push(`<li><a class="pagination-link is-current">${page}</a></li>`);
            } else if (index > 0 && index <= totalPages) {
                items.push(`<li><a class="pagination-link" data-page-number="${index}" data-page-key="${key}">${index}</a></li>`);
            }
        }
        if (totalPages - page > 2) {
            if (totalPages - page !== 3) {
                items.push('<li><span class="pagination-ellipsis">…</span></li>');
            }
            items.push(`<li><a class="pagination-link" data-page-number="${totalPages}" data-page-key="${key}">${totalPages}</a></li>`);
        }
        return `<div class="pagination"><ul class="pagination-list">${items.join('')}</ul></div>`;
    }
})

// -------------------------------------- default util

// formate time
function formatDateString(inputString) {
    const inputDate = new Date(inputString);
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;
    return formattedDate;
}

function generateSequence(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
