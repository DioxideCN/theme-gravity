(function () {
    $('#mobile-directory').click(() => {
        const wrapper = $('.mobile-toc.toc-menu');
        if (wrapper.hasClass('animation-toc-top')) {
            wrapper.removeClass('animation-toc-top').addClass('animation-toc-down');
            $('.navbar-menu').toggleClass('hide-top');
            setTimeout(() => {
                wrapper.removeClass('animation-toc-down');
            }, 600);
        } else {
            wrapper.addClass('animation-toc-top');
            setTimeout(() => {
                $('.navbar-menu').toggleClass('hide-top');
            }, 400);
        }
    });
})();

// Toc定位
$(document).ready((_this => {
    const mobileTocMenu = document.getElementById('mobile-directory-menu');
    const tocMenu = document.getElementById("toc-menu-ul");
    if (tocMenu === null && mobileTocMenu === null) return;
    let _html = "";
    let idSet = new Set();
    let _counter = 0; // 初始化计数器
    $(".post_content.markdown").find("h1, h2, h3, h4, h5, h6").each(function(i) {
        // 获取"h1", "h2", "h3", "h4", "h5", "h6"
        let level = $(this).prop("tagName").substring(1);
        let id = $(this).attr("id");
        let title = $(this).text();
        if (!id) {
            id = "_custom_" + _counter++;
            $(this).attr("id", id);
        }
        idSet.add(id);
        _html += `<li data-level="${level}"><a class="swing-scroll" href="#${id}"${i===0?' class="is-active"':''}>${title}</a></li>`;
    });
    if (tocMenu !== null) {
        tocMenu.innerHTML = _html;
    }
    if (mobileTocMenu !== null) {
        mobileTocMenu.innerHTML = _html;
    }
    // 滚动事件监听
    $(window).on('scroll', function() {
        let scrollPos = $(document).scrollTop();
        let headers = $(".post_content.markdown").find("h1, h2, h3, h4, h5, h6");
        headers.each(function(i) {
            let top = (i === 0 ? 0 : $(this).offset().top - 10);
            let bottom = (i === headers.length - 1 ? $(".post_page").offset().top + $(".post_page").outerHeight(true) : $(headers[i+1]).offset().top - 10);
            let id = $(this).attr("id");
            let isActive = scrollPos >= top && scrollPos < bottom;
            $('#toc-menu-ul li a[href="#'+id+'"], #mobile-directory-menu li a[href="#'+id+'"]').toggleClass("is-active", isActive);
        });
    });
    $('a.swing-scroll').on('click', function(event) {
        event.preventDefault();
        let target = $(this.getAttribute('href'));

        if ($('#mobile-directory').css('display') !== 'none') {
            $('.navbar-menu').toggleClass('hide-top');
            const wrapper = $('.mobile-toc.toc-menu');
            wrapper.removeClass('animation-toc-top').addClass('animation-toc-down');
            setTimeout(() => {
                wrapper.removeClass('animation-toc-down');
            }, 600);
        }

        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 500, 'swing');
        }
    });
    $('.link-wrapper').on('click', function() {
        var title = $('.post_title.post_detail_title h2').text();
        var link = window.location.href;
        var textToCopy = `[${title}]${link}`;
        copyToClipboard(textToCopy);
        cocoMessage.info("链接复制成功！");
    }); 
})(this));

function copyToClipboard(text) {
    var input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}  
