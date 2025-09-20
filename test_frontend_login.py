#!/usr/bin/env python3
"""
Playwright test script to test React frontend login functionality
"""

import asyncio
import time
from playwright.async_api import async_playwright

async def test_frontend_login():
    print("🚀 Starting React Frontend Login Test")
    print("=" * 50)
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)  # Set to True for headless
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # Navigate to React frontend
            print("📱 Navigating to React frontend...")
            await page.goto("http://localhost:3000")
            await page.wait_for_load_state("networkidle")
            
            # Set up console log capture
            console_messages = []
            page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
            page.on("pageerror", lambda error: console_messages.append(f"ERROR: {error}"))
            
            print("📝 Console logging enabled")
            
            # Take screenshot of initial page
            await page.screenshot(path="frontend_initial.png")
            print("📸 Screenshot saved: frontend_initial.png")
            
            # Get page title and URL
            title = await page.title()
            url = page.url
            print(f"📄 Page Title: {title}")
            print(f"🔗 Page URL: {url}")
            
            # Check if login form exists
            print("🔍 Checking for login form...")
            login_form = await page.query_selector("form")
            if login_form:
                print("✅ Login form found")
            else:
                print("❌ Login form not found")
                # Get page content for debugging
                content = await page.content()
                print(f"📝 Page content (first 500 chars): {content[:500]}")
            
            # Look for email input
            email_input = await page.query_selector("input[type='email']")
            if email_input:
                print("✅ Email input found")
            else:
                print("❌ Email input not found")
                # Try to find any input
                all_inputs = await page.query_selector_all("input")
                print(f"🔍 Found {len(all_inputs)} input elements")
                for i, inp in enumerate(all_inputs):
                    placeholder = await inp.get_attribute("placeholder")
                    input_type = await inp.get_attribute("type")
                    print(f"  Input {i+1}: type='{input_type}', placeholder='{placeholder}'")
            
            # Look for password input
            password_input = await page.query_selector("input[type='password']")
            if password_input:
                print("✅ Password input found")
            else:
                print("❌ Password input not found")
            
            # Look for submit button
            submit_button = await page.query_selector("button[type='submit']")
            if submit_button:
                print("✅ Submit button found")
            else:
                print("❌ Submit button not found")
                # Try to find any button
                all_buttons = await page.query_selector_all("button")
                print(f"🔍 Found {len(all_buttons)} button elements")
                for i, btn in enumerate(all_buttons):
                    btn_text = await btn.text_content()
                    print(f"  Button {i+1}: '{btn_text.strip()}'")
            
            # If form elements exist, try to fill and submit
            if email_input and password_input and submit_button:
                print("\n🔧 Attempting to fill login form...")
                
                # Fill email
                await email_input.fill("demo.user@prod.com")
                print("✅ Email filled: demo.user@prod.com")
                
                # Fill password
                await password_input.fill("password")
                print("✅ Password filled: ********")
                
                # Take screenshot before submission
                await page.screenshot(path="frontend_filled_form.png")
                print("📸 Screenshot saved: frontend_filled_form.png")
                
                # Click submit button
                print("🖱️ Clicking submit button...")
                await submit_button.click()
                
                # Wait for navigation or response
                try:
                    await page.wait_for_navigation(timeout=10000)
                    print("✅ Navigation occurred after login")
                except:
                    print("⏱️ No navigation occurred, checking for other responses...")
                
                # Wait longer for any AJAX requests and page updates
                await page.wait_for_timeout(5000)
                
                # Take screenshot after submission
                await page.screenshot(path="frontend_after_login.png")
                print("📸 Screenshot saved: frontend_after_login.png")
                
                # Check current URL and page content
                current_url = page.url
                print(f"🔗 Current URL after login: {current_url}")
                
                # Check for error messages
                error_elements = await page.query_selector_all("[style*='background-color: rgb(248, 215, 218)']")
                if error_elements:
                    print("❌ Error messages found:")
                    for error in error_elements:
                        error_text = await error.text_content()
                        print(f"   Error: {error_text.strip()}")
                else:
                    print("✅ No error messages detected")
                
                # Check for various success indicators and content
                print("\n🔍 Checking for post-login content...")
                
                # Check for Chat interface
                chat_indicators = await page.query_selector_all("text=Chat")
                if chat_indicators:
                    print("✅ Chat interface found")
                else:
                    print("ℹ️ Chat interface not found")
                
                # Check for Policy cards
                policy_indicators = await page.query_selector_all("text=Policy")
                if policy_indicators:
                    print("✅ Policy information found")
                else:
                    print("ℹ️ Policy information not found")
                
                # Check for Claim information
                claim_indicators = await page.query_selector_all("text=Claim")
                if claim_indicators:
                    print("✅ Claim information found")
                else:
                    print("ℹ️ Claim information not found")
                
                # Check for Dashboard or user content
                dashboard_indicators = await page.query_selector_all("text=Dashboard")
                if dashboard_indicators:
                    print("✅ Dashboard found")
                else:
                    print("ℹ️ Dashboard not found")
                
                # Check for any user-related content
                user_content = await page.query_selector_all("text=Welcome,")
                if user_content:
                    print("✅ User welcome message found")
                else:
                    print("ℹ️ User welcome message not found")
                
                # Check for logout button
                logout_button = await page.query_selector_all("button")
                logout_found = False
                for button in logout_button:
                    button_text = await button.text_content()
                    if button_text and "logout" in button_text.lower():
                        print("✅ Logout button found")
                        logout_found = True
                        break
                if not logout_found:
                    print("ℹ️ Logout button not found")
                
                # Get page title to see if it changed
                new_title = await page.title()
                print(f"📄 Page title after login: {new_title}")
                
                # Look for any visible content areas
                print("\n📋 Checking page content structure...")
                
                # Check for main content areas
                main_content = await page.query_selector_all("main, .content, .dashboard, .chat-container")
                if main_content:
                    print(f"✅ Found {len(main_content)} main content areas")
                else:
                    print("ℹ️ No main content areas found")
                
                # Check for any cards or components
                cards = await page.query_selector_all(".card, .policy-card, .claim-banner, .component")
                if cards:
                    print(f"✅ Found {len(cards)} card/component elements")
                else:
                    print("ℹ️ No card/component elements found")
                
                # Get actual page text content (first 500 chars)
                page_text = await page.text_content("*")
                print(f"\n📝 Page text content (first 300 chars): {page_text[:300]}")
                
                # Check console for errors
                console_logs = []
                page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))
                
                # Wait a bit more to capture any console errors
                await page.wait_for_timeout(2000)
                
                if console_logs:
                    print("📋 Console logs:")
                    for log in console_logs:
                        print(f"   {log}")
                else:
                    print("✅ No console errors detected")
                
            else:
                print("❌ Cannot proceed with login test - form elements missing")
            
            # Check network requests
            print("\n🌐 Checking network requests...")
            network_requests = []
            
            def handle_request(request):
                network_requests.append({
                    "url": request.url,
                    "method": request.method,
                    "resource_type": request.resource_type
                })
            
            def handle_response(response):
                if response.status >= 400:
                    print(f"❌ Failed response: {response.status} {response.url}")
            
            page.on("request", handle_request)
            page.on("response", handle_response)
            
            # Wait a bit to capture network activity
            await page.wait_for_timeout(2000)
            
            # Filter for API requests
            api_requests = [req for req in network_requests if "localhost:3000" in req["url"]]
            if api_requests:
                print(f"📡 Found {len(api_requests)} API requests:")
                for req in api_requests:
                    print(f"   {req['method']} {req['url']} ({req['resource_type']})")
            else:
                print("ℹ️ No API requests detected")
            
        except Exception as e:
            print(f"❌ Test failed with error: {str(e)}")
            # Take screenshot of error state
            await page.screenshot(path="frontend_error.png")
            print("📸 Error screenshot saved: frontend_error.png")
            
            # Get page content for debugging
            content = await page.content()
            print(f"📝 Page content at error (first 1000 chars): {content[:1000]}")
        
        finally:
            # Close browser
            await browser.close()
            print("\n🏁 Test completed")
            print("=" * 50)

async def main():
    await test_frontend_login()

if __name__ == "__main__":
    asyncio.run(main())
