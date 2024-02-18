window.addEventListener('load', async function() {
    const formatter = { year: 'numeric', month: 'long', day: 'numeric' };
    const month = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const emptyBarHTML = '<div class="sidebar-empty">这里似乎空空如也</div>';

    if (typeof posts === "undefined") {
        return;
    }

    let copiedPosts = posts;
    posts = null; // 销毁对象
    let clearableScripts = document.querySelectorAll('script.clearable');
    clearableScripts.forEach(script => script.remove());

    // 热点文章模块
    const sortedPosts = copiedPosts.sort((a, b) => b.stats.visit - a.stats.visit).slice(0, 5);
    const sortedPostsElement = document.getElementById('sortedPosts');
    let sortedPostsElementInnerHTML = '';
    sortedPosts.forEach(post => {
        sortedPostsElementInnerHTML += `<div href="${post.status.permalink}" class="hot-post-node">
            <div class="left-icon">
                <i class="ri-chat-poll-line"></i>
            </div>
            <div class="right-content">
                <a href="${post.status.permalink}" class="link-green">${post.spec.title}</a><p>${post.stats.visit}浏览·${post.stats.upvote}支持</p>
            </div>
        </div>`;
    });
    sortedPostsElement.innerHTML = sortedPostsElementInnerHTML ? sortedPostsElementInnerHTML : emptyBarHTML;

    const activityPostsElement = document.getElementById('activityPosts');
    if (activityPostsElement !== null) {
        const totalPostArray = (copiedPosts => {
            const countsByYear = {};
            copiedPosts.forEach(post => {
                const publishTime = new Date(post.spec.publishTime);
                if (!isNaN(publishTime)) {
                    const year = publishTime.getUTCFullYear();
                    const month = publishTime.getUTCMonth();
                    const day = publishTime.getUTCDate();
                    const zerothOfJanuary = Date.UTC(year, 0, 1);
                    const zerothOfDay = Date.UTC(year, month, day);
                    const dayOfYear = Math.floor((zerothOfDay - zerothOfJanuary) / 86400000);
                    const weekNumber = Math.floor(dayOfYear / 7) + 1;
        
                    if (!countsByYear[year]) {
                        countsByYear[year] = Array(52).fill(0);
                    }
        
                    if (weekNumber >= 1 && weekNumber <= 52) {
                        countsByYear[year][weekNumber - 1]++;
                    }
                }
            });
            return Object.keys(countsByYear).map(year => ({ [year]: countsByYear[year] }));
        })(copiedPosts);
        let addingActivity = '';
        totalPostArray.forEach(yearObj => {
            let year = Object.keys(yearObj)[0];
            let arr = yearObj[year];
            let points = arr.map((value, index) => `${index*3},${value+1}`).join(' ');
            let total = arr.reduce((a, b) => a + b, 0);
            let uuid = Math.random().toString().slice(2,11);
            addingActivity += `<div class="each-statistics-card">
                <div class="card-content">
                    <p class="title-time">${year}年</p>
                    <p class="title-count">${total}篇</p>
                </div>
                <div class="card-svg">
                    <svg width="155" height="30">
                        <defs>
                            <linearGradient id="gradient-${uuid}" x1="0" x2="0" y1="1" y2="0">
                                <stop offset="0%" stop-color="#67BD5C"></stop>
                                <stop offset="50%" stop-color="#B6CE3B"></stop>
                            </linearGradient>
                            <mask id="sparkline-${uuid}" x="0" y="0" width="155" height="28">
                                <polyline transform="translate(0, 28) scale(1,-1)" points="${points}" fill="transparent" stroke="#8cc665" stroke-width="2"></polyline>
                            </mask>
                        </defs>
                        <g transform="translate(0, 2.0)">
                            <rect x="0" y="-2" width="155" height="30" style="stroke: none; fill: url(#gradient-${uuid}); mask: url(#sparkline-${uuid})"></rect>
                        </g>
                    </svg>
                </div>
            </div>`;
        });
        activityPostsElement.innerHTML = addingActivity ? addingActivity : emptyBarHTML;
    }

    // 最近评论模块
    async function fetchAndProcessComments() {
        const hostname = new URL(window.location.href).hostname;
        const [owner, repo] = githubInfo.split("/");
        let rawData = await fetch(`/apis/api.plugin.halo.run/v1alpha1/plugins/gravity-power/github/discussions?owner=${owner}&repo=${repo}`);
        rawData = await rawData.json();
        let discussions = rawData.data.repository.discussions.edges;
        let comments = discussions.map((discussion) => {
            if (!discussion.node.title.includes(hostname)) return [];
            return discussion.node.comments.edges.map(comment => {
                return {
                    from: discussion.node.title,
                    author: comment.node.author.login,
                    avatar: comment.node.author.avatarUrl,
                    content: comment.node.bodyText,
                    createdAt: comment.node.createdAt
                };
            });
        }).flat();
        comments = comments.filter(comment => comment.from);
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return comments;
    }
    if (githubInfo && githubInfo.includes("/")) {
        const comments = await fetchAndProcessComments();
        const commentNode = document.getElementById('newestComment');
        if (commentNode !== null) {
            let innerHtmlContent = '';
            for (let i = 0; i < 5; i++) {
                const comment = comments[i];
                innerHtmlContent += `
                <div class="each-comment-card">
                    <div class="comment-box">
                        <div class="comment-img">
                            <a href="${comment.from}"><img class="comment-avatar" width="32" height="32" alt="avatar" src="${comment.avatar}" /></a>
                        </div>
                        <div class="comment-content">
                            <p class="comment-poster">${comment.author}</p>
                            <p class="comment-detail">${comment.content}</p>
                            <p class="comment-time">${new Date(comment.createdAt).toLocaleDateString('zh-CN', formatter)}</p>
                        </div>
                    </div>
                </div>`;
            }
            commentNode.innerHTML = innerHtmlContent ? innerHtmlContent : emptyBarHTML;
        }
    }

    // 天气模块
    const weatherWidget = document.getElementById('weather-widget');
    const weatherDate = document.getElementById('weather-date');
    if (weatherWidget !== null && weatherDate !== null) {
        if (window.innerWidth < 768) return;
        let date = new Date();
        weatherDate.innerHTML = `
                <h4 class="month">${month[date.getMonth()]}</h4>
                <h5 class="day">${date.getDate()}</h5>`;
        const data = await fetch(`/apis/api.plugin.halo.run/v1alpha1/plugins/gravity-power/weather/get`).then(res => res.json());
        weatherWidget.innerHTML = `
            <h1 class="temperature">${data.weatherData.now.temp}&deg;</h1>
            <h2 class="description"><i class="qi-${data.weatherData.now.icon}"></i>${data.weatherData.now.text}</h2>
            <h3 class="city">${data.cityName}</h3>`;
    }

    // call gc
    copiedPosts = null;
});