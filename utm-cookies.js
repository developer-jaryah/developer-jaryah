<!-- Save UTM Values in Cookies -->
(function() {
    // Utility function to get a URL parameter by name
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Utility function to set a cookie
    function setCookie(name, value, minutes) {
        var expires = "";
        if (minutes) {
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Utility function to get a cookie by name
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Utility function to check if the referrer is LinkedIn
    function isLinkedInReferrer(referrer) {
        return referrer.includes('linkedin.');
    }

    // Utility function to set default UTM values based on referrer
    function setReferrerDefaults(referrer) {
        var currentURL = window.location.href;
        if (!referrer) {
            setCookie('utm_source', currentURL, 480);
            setCookie('utm_medium', 'Direct', 480);
            setCookie('utm_campaign', 'Not-Provided', 480);
        } else if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('yahoo.')) {
            var searchEngine = referrer.includes('google.') ? 'Google' : referrer.includes('bing.') ? 'Bing' : 'Yahoo';
            setCookie('utm_source', searchEngine, 480);
            setCookie('utm_medium', 'Organic Search', 480);
            setCookie('utm_campaign', 'Not-Provided', 480);
        } else if (referrer.includes('facebook.') || referrer.includes('t.co') || isLinkedInReferrer(referrer)) {
            var socialNetwork = referrer.includes('facebook.') ? 'Facebook' : referrer.includes('t.co') ? 'Twitter' : 'LinkedIn';
            setCookie('utm_source', socialNetwork, 480);
            setCookie('utm_medium', 'Organic Social', 480);
            setCookie('utm_campaign', 'Not-Provided', 480);
        } else {
            setCookie('utm_source', referrer, 480);
            setCookie('utm_medium', 'Referral', 480);
            setCookie('utm_campaign', 'Not-Provided', 480);
        }
    }

    // Main logic to track UTMs and store them in cookies
    function trackUTMs() {
        var utmParams = {
            'utm_source': getUrlParameter('utm_source'),
            'utm_medium': getUrlParameter('utm_medium'),
            'utm_campaign': getUrlParameter('utm_campaign'),
            'utm_content': getUrlParameter('utm_content'),
            'utm_term': getUrlParameter('utm_term'),
            'gclid': getUrlParameter('gclid'),
            'fbclid': getUrlParameter('fbclid')
        };

        // Store UTM parameters in cookies if they exist and are not already set
        for (var key in utmParams) {
            if (utmParams[key] && !getCookie(key)) {
                setCookie(key, utmParams[key], 480);
            }
        }

        // If no UTM parameters are present, set defaults based on referrer
        var referrer = document.referrer;
        if (!utmParams['utm_source'] && !utmParams['utm_medium'] && !utmParams['utm_campaign'] && !getCookie('utm_source')) {
            setReferrerDefaults(referrer);
        }

        // Store UTM values in localStorage after setting cookies
        storeUTMsInLocalStorage(); // <-- Moved this here
    }

    // Function to store UTM values in localStorage
    function storeUTMsInLocalStorage() {
        var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

        // Check if local storage is empty and take values from cookies
        var isLocalStorageEmpty = utmParams.every(param => !localStorage.getItem(param));
        
        if (isLocalStorageEmpty) {
            utmParams.forEach(function(param) {
                var value = getCookie(param);
                if (value) {
                    localStorage.setItem(param, value);
                }
            });
        }
    }

    // Function to populate form fields with UTM values from cookies
    function populateFormFields() {
        var forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            var utmFields = {
                'utm_source': 'UTM_Source__c',
                'utm_medium': 'UTM_Medium__c',
                'utm_campaign': 'UTM_Campaign__c',
                'utm_content': 'UTM_Content__c',
                'utm_term': 'UTM_Term__c'
            };
            for (var cookieName in utmFields) {
                var value = localStorage.getItem(cookieName) || ''; // Use localStorage value
                var fieldName = utmFields[cookieName];
                var input = form.querySelector('input[name="' + fieldName + '"]');
                if (input) {
                    input.value = value;
                } else {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = fieldName;
                    input.value = value;
                    form.appendChild(input);
                }
            }
        });
    }

    // Restore UTM values from localStorage to cookies if they are missing
    function restoreUTMsFromLocalStorageToCookies() {
        var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
        utmParams.forEach(function(param) {
            if (!getCookie(param)) { // Only set cookie if it's not already set
                var value = localStorage.getItem(param);
                if (value) {
                    setCookie(param, value, 480); // Restore from localStorage
                }
            }
        });
    }

    // Restore UTM values from localStorage if cookies are removed
    function restoreUTMsFromLocalStorage() {
        var localUTMs = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
        localUTMs.forEach(function(param) {
            var value = localStorage.getItem(param);
            if (value) {
                setCookie(param, value, 480);
            }
        });
    }

    // Run the tracking, form population, and restoration logic on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Restore UTM values from localStorage to cookies if necessary
        restoreUTMsFromLocalStorageToCookies();
        // Track UTMs and populate form fields
        trackUTMs();
        setTimeout(populateFormFields, 2000); // Delay for 2 seconds to ensure form is loaded
        // Restore UTM values from localStorage if cookies are removed
        restoreUTMsFromLocalStorage();
    });
})();
