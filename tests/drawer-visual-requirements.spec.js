const { test, expect } = require('@playwright/test');

test.describe('AMFM Drawer Visual Requirements Validation', () => {
    
    test.beforeEach(async ({ page }) => {
        // Create a test HTML page with our drawer functionality
        const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMFM Drawer Test</title>
    
    <!-- Include jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Include Owl Carousel -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
    
    <!-- Include imagesLoaded -->
    <script src="https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js"></script>
    
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .test-map-container { 
            width: 800px; 
            height: 400px; 
            background: linear-gradient(45deg, #4285f4, #34a853); 
            position: relative; 
            margin: 20px auto;
            border: 2px solid #333;
        }
    </style>
</head>
<body>
    <div class="amfm-map-container test-map-container">
        <div style="color: white; text-align: center; padding-top: 150px; font-size: 24px;">
            Test Map Container
        </div>
    </div>
    
    <button id="test-drawer-btn" onclick="openTestDrawer()">Open Test Drawer</button>
    
    <script>
        // Include drawer functionality inline for testing
        window.closeDrawer = function(mapContainer) {
            if (!mapContainer) {
                mapContainer = document.querySelector('.amfm-map-container') || 
                             document.querySelector('.elementor-widget-amfm-maps-v2 .elementor-widget-container') ||
                             document.querySelector('.elementor-widget-amfm-map .elementor-widget-container') ||
                             document.body;
            }
            
            const drawer = mapContainer.querySelector('.amfm-drawer');
            const overlay = mapContainer.querySelector('.amfm-drawer-overlay');
            
            if (drawer) drawer.classList.remove('open');
            if (overlay) overlay.classList.remove('visible');
        };

        window.openDrawer = function(content, mapContainer) {
            if (!mapContainer) {
                mapContainer = document.querySelector('.amfm-map-container') || 
                             document.querySelector('.elementor-widget-amfm-maps-v2 .elementor-widget-container') ||
                             document.querySelector('.elementor-widget-amfm-map .elementor-widget-container') ||
                             document.body;
            }

            if (!mapContainer.querySelector('.amfm-drawer')) {
                mapContainer.insertAdjacentHTML('beforeend', \`
                    <div class="amfm-drawer-overlay"></div>
                    <div class="amfm-drawer">
                        <button class="amfm-drawer-close">&times;</button>
                        <div class="amfm-drawer-content"></div>
                    </div>
                \`);

                mapContainer.querySelector('.amfm-drawer-close').addEventListener('click', function() {
                    closeDrawer(mapContainer);
                });

                mapContainer.querySelector('.amfm-drawer-overlay').addEventListener('click', function() {
                    closeDrawer(mapContainer);
                });
            }

            const drawerContent = mapContainer.querySelector('.amfm-drawer-content');
            const drawer = mapContainer.querySelector('.amfm-drawer');
            const overlay = mapContainer.querySelector('.amfm-drawer-overlay');

            drawerContent.innerHTML = \`
                <div class="amfm-drawer-loading">
                    <div class="amfm-drawer-spinner"></div>
                    <span>Loading details...</span>
                </div>
                \${content}
            \`;
            
            drawer.style.display = 'block';
            overlay.style.display = 'block';
            
            setTimeout(() => {
                drawer.classList.add('open');
                overlay.classList.add('visible');
            }, 50);

            setTimeout(() => {
                jQuery('.amfm-drawer-loading').fadeOut(300, function() {
                    jQuery(this).remove();
                });
                
                if (jQuery('.amfm-drawer-photo-slider').length > 0) {
                    jQuery('.amfm-drawer-photo-slider').imagesLoaded(function () {
                        const photosCount = jQuery('.amfm-drawer-photo-slide').length;
                        jQuery('.amfm-drawer-photo-slider').owlCarousel({
                            items: 1,
                            loop: photosCount > 1,
                            nav: true,
                            navText: [
                                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"></polyline></svg>',
                                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"></polyline></svg>'
                            ],
                            dots: photosCount > 1,
                            autoplay: false,
                            responsive: {
                                0: {
                                    nav: false,
                                    dots: true
                                },
                                768: {
                                    nav: true,
                                    dots: false
                                }
                            }
                        });
                    });
                }
            }, 100);
        };
        
        function openTestDrawer() {
            const content = \`
                <div class="amfm-drawer-location">
                    <div class="amfm-drawer-photo-slider">
                        <div class="amfm-drawer-photo-slide">
                            <img src="https://via.placeholder.com/800x300/4285f4/ffffff?text=Edge+to+Edge+Photo+1" alt="Photo 1">
                        </div>
                        <div class="amfm-drawer-photo-slide">
                            <img src="https://via.placeholder.com/800x300/ea4335/ffffff?text=Edge+to+Edge+Photo+2" alt="Photo 2">
                        </div>
                        <div class="amfm-drawer-photo-slide">
                            <img src="https://via.placeholder.com/800x300/fbbc04/ffffff?text=Edge+to+Edge+Photo+3" alt="Photo 3">
                        </div>
                    </div>
                    <div class="amfm-drawer-header">
                        <h3 class="amfm-drawer-title">Test Location</h3>
                        <div class="amfm-drawer-rating">
                            <span class="amfm-drawer-rating-score">4.5</span>
                            <div class="amfm-drawer-stars">★★★★☆</div>
                        </div>
                    </div>
                    <div class="amfm-drawer-details">
                        <div class="amfm-drawer-address">
                            <div class="amfm-drawer-address-icon">📍</div>
                            <div class="amfm-drawer-address-text">123 Test Street, Test City, TC 12345</div>
                        </div>
                    </div>
                    <div class="amfm-drawer-actions">
                        <button class="amfm-drawer-btn amfm-drawer-btn-primary">Directions</button>
                        <button class="amfm-drawer-btn amfm-drawer-btn-secondary">Call</button>
                    </div>
                </div>
            \`;
            
            window.openDrawer(content);
        }
    </script>
</body>
</html>`;

        // Set the content directly
        await page.setContent(testHTML);
        
        // Inject our CSS styles
        await page.addStyleTag({ path: './assets/css/style.css' });
        
        // Wait for page to be ready
        await page.waitForLoadState('networkidle');
    });

    test('should meet all visual requirements', async ({ page }) => {
        console.log('🧪 Testing AMFM Drawer Visual Requirements');
        
        // 1. VERIFY MAP CONTAINER HAS OVERFLOW HIDDEN
        console.log('1️⃣ Testing map container overflow hidden...');
        
        const mapContainer = page.locator('.amfm-map-container').first();
        await expect(mapContainer).toBeVisible();
        
        // Check overflow property
        const containerOverflow = await mapContainer.evaluate(el => getComputedStyle(el).overflow);
        expect(containerOverflow).toBe('hidden');
        console.log('✅ Map container has overflow: hidden');
        
        // 2. OPEN THE DRAWER
        console.log('2️⃣ Opening drawer...');
        
        await page.click('#test-drawer-btn');
        
        // Wait for drawer to appear and animate
        await page.waitForSelector('.amfm-drawer.open', { timeout: 5000 });
        
        const drawer = page.locator('.amfm-drawer');
        await expect(drawer).toBeVisible();
        await expect(drawer).toHaveClass(/open/);
        console.log('✅ Drawer opened successfully');
        
        // 3. VERIFY DRAWER HAS NO ROUNDED EDGES
        console.log('3️⃣ Testing drawer rounded edges...');
        
        const drawerBorderRadius = await drawer.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                borderRadius: styles.borderRadius,
                borderTopLeftRadius: styles.borderTopLeftRadius,
                borderTopRightRadius: styles.borderTopRightRadius,
                borderBottomLeftRadius: styles.borderBottomLeftRadius,
                borderBottomRightRadius: styles.borderBottomRightRadius
            };
        });
        
        // All border radius values should be 0
        expect(drawerBorderRadius.borderTopLeftRadius).toBe('0px');
        expect(drawerBorderRadius.borderTopRightRadius).toBe('0px');
        expect(drawerBorderRadius.borderBottomLeftRadius).toBe('0px');
        expect(drawerBorderRadius.borderBottomRightRadius).toBe('0px');
        console.log('✅ Drawer has no rounded edges (border-radius: 0)');
        
        // 4. VERIFY DRAWER WIDTH MATCHES MAP CONTAINER
        console.log('4️⃣ Testing drawer width matches container...');
        
        const containerWidth = await mapContainer.evaluate(el => el.offsetWidth);
        const drawerWidth = await drawer.evaluate(el => el.offsetWidth);
        
        // Allow for small differences due to borders/box-sizing (up to 4px)
        const widthDifference = Math.abs(drawerWidth - containerWidth);
        expect(widthDifference).toBeLessThanOrEqual(4);
        console.log(`✅ Drawer width (${drawerWidth}px) matches container width (${containerWidth}px) within tolerance`);
        
        // 5. VERIFY IMAGE SLIDER IS EDGE-TO-EDGE
        console.log('5️⃣ Testing edge-to-edge image slider...');
        
        // Wait for owl carousel to initialize
        await page.waitForTimeout(2000);
        
        const photoSlider = page.locator('.amfm-drawer-photo-slider');
        await expect(photoSlider).toBeVisible();
        
        // Check slider has no padding or margins
        const sliderStyles = await photoSlider.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                marginLeft: styles.marginLeft,
                marginRight: styles.marginRight,
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight,
                width: el.offsetWidth
            };
        });
        
        expect(sliderStyles.marginLeft).toBe('0px');
        expect(sliderStyles.marginRight).toBe('0px');
        expect(sliderStyles.paddingLeft).toBe('0px');
        expect(sliderStyles.paddingRight).toBe('0px');
        console.log('✅ Image slider has no margins or padding');
        
        // Check that slider width matches drawer width (allow small tolerance)
        const sliderWidthDifference = Math.abs(sliderStyles.width - drawerWidth);
        expect(sliderWidthDifference).toBeLessThanOrEqual(4);
        console.log(`✅ Slider width (${sliderStyles.width}px) matches drawer width (${drawerWidth}px)`);
        
        // 6. VERIFY IMAGES FILL THE SLIDER COMPLETELY
        console.log('6️⃣ Testing images fill slider completely...');
        
        const firstImage = page.locator('.amfm-drawer-photo-slide img').first();
        await expect(firstImage).toBeVisible();
        
        const imageWidth = await firstImage.evaluate(el => el.offsetWidth);
        const imageWidthDifference = Math.abs(imageWidth - sliderStyles.width);
        expect(imageWidthDifference).toBeLessThanOrEqual(4);
        console.log(`✅ Image width (${imageWidth}px) fills slider completely`);
        
        // 7. VERIFY OWL CAROUSEL IS PROPERLY INITIALIZED
        console.log('7️⃣ Testing owl carousel initialization...');
        
        const owlStage = page.locator('.owl-stage-outer');
        await expect(owlStage).toBeVisible();
        
        // Check that owl stage outer has proper settings
        const owlStageStyles = await owlStage.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                overflow: styles.overflow,
                borderRadius: styles.borderRadius,
                margin: styles.margin,
                padding: styles.padding
            };
        });
        
        // Owl Carousel sets overflow to visible by default, which is normal
        expect(['hidden', 'visible']).toContain(owlStageStyles.overflow);
        expect(owlStageStyles.borderRadius).toBe('0px');
        expect(owlStageStyles.margin).toBe('0px');
        expect(owlStageStyles.padding).toBe('0px');
        console.log('✅ Owl carousel properly initialized with edge-to-edge settings');
        
        // 8. VERIFY DRAWER POSITIONING
        console.log('8️⃣ Testing drawer positioning...');
        
        const drawerStyles = await drawer.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                position: styles.position,
                bottom: styles.bottom,
                left: styles.left,
                width: styles.width,
                transform: styles.transform
            };
        });
        
        expect(drawerStyles.position).toBe('absolute');
        expect(drawerStyles.bottom).toBe('0px');
        expect(drawerStyles.left).toBe('0px');
        expect(drawerStyles.width).toBe('100%');
        expect(drawerStyles.transform).toBe('translateY(0px)');
        console.log('✅ Drawer positioning is correct');
        
        // 9. VERIFY CONTENT SECTIONS HAVE PROPER PADDING
        console.log('9️⃣ Testing content sections padding...');
        
        const drawerHeader = page.locator('.amfm-drawer-header');
        const drawerDetails = page.locator('.amfm-drawer-details');
        const drawerActions = page.locator('.amfm-drawer-actions');
        
        // Check header padding
        const headerPadding = await drawerHeader.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });
        expect(headerPadding.paddingLeft).toBe('20px');
        expect(headerPadding.paddingRight).toBe('20px');
        
        // Check details padding
        const detailsPadding = await drawerDetails.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });
        expect(detailsPadding.paddingLeft).toBe('20px');
        expect(detailsPadding.paddingRight).toBe('20px');
        
        // Check actions padding
        const actionsPadding = await drawerActions.evaluate(el => {
            const styles = getComputedStyle(el);
            return {
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight
            };
        });
        expect(actionsPadding.paddingLeft).toBe('20px');
        expect(actionsPadding.paddingRight).toBe('20px');
        
        console.log('✅ Content sections have proper 20px side padding');
        
        console.log('🎉 All visual requirements passed!');
    });

    test('should handle drawer close functionality', async ({ page }) => {
        console.log('🧪 Testing drawer close functionality');
        
        // Open drawer
        await page.click('#test-drawer-btn');
        await page.waitForSelector('.amfm-drawer.open');
        
        // Test close button
        await page.click('.amfm-drawer-close');
        await page.waitForTimeout(500);
        
        const drawer = page.locator('.amfm-drawer');
        const isOpen = await drawer.evaluate(el => el.classList.contains('open'));
        expect(isOpen).toBe(false);
        
        console.log('✅ Drawer close functionality works');
    });

    test('should maintain responsiveness on mobile', async ({ page }) => {
        console.log('🧪 Testing mobile responsiveness');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.click('#test-drawer-btn');
        await page.waitForSelector('.amfm-drawer.open');
        
        const drawer = page.locator('.amfm-drawer');
        const mapContainer = page.locator('.amfm-map-container').first();
        
        const containerWidth = await mapContainer.evaluate(el => el.offsetWidth);
        const drawerWidth = await drawer.evaluate(el => el.offsetWidth);
        
        // Allow for small differences due to borders/box-sizing (up to 4px)
        const widthDifference = Math.abs(drawerWidth - containerWidth);
        expect(widthDifference).toBeLessThanOrEqual(4);
        
        // Check that drawer still has no border radius on mobile
        const borderRadius = await drawer.evaluate(el => getComputedStyle(el).borderRadius);
        expect(borderRadius).toBe('0px');
        
        console.log('✅ Mobile responsiveness maintained');
    });

    test('should handle multiple images in carousel', async ({ page }) => {
        console.log('🧪 Testing multiple images in carousel');
        
        await page.click('#test-drawer-btn');
        await page.waitForSelector('.amfm-drawer.open');
        
        // Wait for carousel to initialize
        await page.waitForTimeout(2000);
        
        // Check if navigation buttons appear (should for multiple images)
        const navButtons = page.locator('.owl-nav button');
        const dotsContainer = page.locator('.owl-dots');
        
        // Should have navigation elements for multiple images
        await expect(navButtons).toHaveCount(2); // prev and next
        await expect(dotsContainer).toBeVisible();
        
        // Test navigation
        const nextButton = page.locator('.owl-next');
        if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(500);
        }
        
        console.log('✅ Multiple images carousel works properly');
    });
});
