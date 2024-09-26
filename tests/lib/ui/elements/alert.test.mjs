/**
 * ## layer.decorateTest()
 * @module ui/elements/alert
 */
/**
 * This function is used to test the alert method
 * @function alertTest 
*/
export async function alertTest() {
    await codi.describe('UI elements: Alert', async () => {

        // Test providing params
        await codi.describe('Should create an alert with params provided', async () => {
            mapp.ui.elements.alert({ title: 'ALERT TITLE', text: 'ALERT TEXT' });

            // Get the alert element
            const alert = document.querySelector('body > dialog');
            codi.assertTrue(alert !== undefined, 'We expect to see the alert element');

            await codi.it('Should have a title of ALERT TITLE', async () => {
                // Get the alert title
                const alert_title = alert.querySelector('h4').textContent;
                codi.assertEqual(alert_title, 'ALERT TITLE', 'We expect to see the alert title');

            });

            await codi.it('Should have a text of ALERT TEXT', async () => {
                // Get the alert text
                const alert_text = alert.querySelector('p').textContent;
                codi.assertEqual(alert_text, 'ALERT TEXT', 'We expect to see the alert text');
            })
            // Close the alert 
            alert.remove();

        });

        // Test providing no params
        await codi.describe('Should create an alert with no params provided', async () => {
            mapp.ui.elements.alert({});

            // Get the alert element
            const alert = document.querySelector('body > dialog');
            codi.assertTrue(alert !== undefined, 'We expect to see the alert element');

            await codi.it('Should have a title of Information', async () => {
                // Get the alert title
                const alert_title = alert.querySelector('h4').textContent;
                codi.assertEqual(alert_title, 'Information', 'We expect to see the alert title');

            });

            await codi.it('Should have no text', async () => {
                // Get the alert text
                const alert_text = alert.querySelector('p').textContent;
                codi.assertEqual(alert_text, '', 'We expect to see no alert text');
            })
            // Close the alert 
            alert.remove();

        });

    });
}