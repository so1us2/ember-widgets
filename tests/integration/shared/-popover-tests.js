import PopoverComponent from 'ember-widgets/components/popover-component';
import ModalComponent from 'ember-widgets/components/modal-component';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

function waitUntil(cb) {
  return new Promise(resolve => {
    function checkCb() {
      let result = cb();
      if (result) {
        resolve(result);
      } else {
        window.setTimeout(checkCb, 5);
      }
    }
    checkCb();
  });
}

export default function runPopoverTests(test, {makeComponent, openPopover, openModal, skipDeprecatedAPIFailingTests}) {
  test('it renders popovers', function(assert) {
    let componentSpec = makeComponent(this, 'test-popover', PopoverComponent, {
      layoutName: 'ember-widgets/-test-popover-content'
    });
  
    this.render(hbs`{{render-popover}}`);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]') === null,
      'The popover is not rendered yet'
    );
  
    openPopover(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The popover is now rendered'
    );
  });
  
  test('it programatically closes popovers', function(assert) {
    let componentSpec = makeComponent(this, 'test-popover', PopoverComponent, {
      layoutName: 'ember-widgets/-test-popover-content'
    });
  
    this.render(hbs`{{render-popover}}`);
  
    let close =  openPopover(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The popover is now rendered'
    );
  
    Ember.run(() => { close(); });
  
    assert.ok(
      document.querySelector('[data-test-popover-content]') === null,
      'The popover is closed'
    );
  });
  
  test('it closes popovers from an event', function(assert) {
    let componentSpec = makeComponent(this, 'test-popover', PopoverComponent, {
      layoutName: 'ember-widgets/-test-popover-content'
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The popover is now rendered'
    );
  
    return new Promise(resolve => {
      // The document event handlers are installed in a run.next, so
      // schedule this test/assertion for after that. Additionally,
      // wait for an animation.
      window.setTimeout(() => {
        $(document).trigger('popover:hide');
        resolve();
      }, 50);
    }).then(() => {
      // Wait for an animation
      return waitUntil(() => document.querySelector('[data-test-popover-content]') === null);
    }).then(() => {
      assert.ok(
        true,
        'The popover is closed'
      );
    });
  });
  
  test('it handles actions in a popover', function(assert) {
    let hasActionFired = false;
    let componentSpec = makeComponent(this, 'test-popover', PopoverComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
      actions: {
        fire() {
          hasActionFired = true;
        }
      }
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.notOk(
      hasActionFired,
      'precond - action has not fired'
    );
  
    $(document.querySelector('[data-test-fire-action]')).click();
  
    assert.ok(
      hasActionFired,
      'Action was fired'
    );
  });
  
  test('it handles event delegation in a popover', function(assert) {
    let hasHandledClick = false;
    let componentSpec = makeComponent(this, 'test-popover', PopoverComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
      click() {
        hasHandledClick = true;
      }
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.notOk(
      hasHandledClick,
      'precond - click event had not been handled'
    );
  
    $(document.querySelector('[data-test-popover-content]')).click();
  
    assert.ok(
      hasHandledClick,
      'Click event handled'
    );
  });
  
  test('it renders modals', function(assert) {
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
    });
  
    this.render(hbs`{{render-popover}}`);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]') === null,
      'The modal is not rendered yet'
    );
  
    openModal(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The modal is now rendered'
    );
  });
  
  test('it programatically closes modals', function(assert) {
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
    });
  
    this.render(hbs`{{render-popover}}`);
  
    let close = openModal(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The modal is now rendered'
    );
  
    Ember.run(() => {
      close();
    });
  
    assert.ok(
      document.querySelector('[data-test-popover-content]') === null,
      'The modal is closed'
    );
  });
  
  test('it closes modals from an event', function(assert) {
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.ok(
      document.querySelector('[data-test-popover-content]'),
      'The modal is now rendered'
    );
  
    return new Promise(resolve => {
      // The document event handlers are installed in a run.next, so
      // schedule this test/assertion for after that. Additionally,
      // wait for the background fade animation.
      window.setTimeout(() => {
        $(document).trigger('modal:hide');
        resolve();
      }, 50);
    }).then(() => {
      // Wait for an animation
      return waitUntil(() => document.querySelector('[data-test-popover-content]') === null);
    }).then(() => {
      assert.ok(
        true,
        'The modal is closed'
      );
    });
  });

  test('it closes other modals when opening', function(assert) {
    this.container.register('template:test-modal-1', hbs`<h1 data-test-modal-1>modal 1</h1>`);
    this.container.register('template:test-modal-2', hbs`<h1 data-test-modal-2>modal 2</h1>`);
    let component1 = makeComponent(this, 'test-modal-1', ModalComponent, {
      layoutName: 'test-modal-1'
    });
    let component2 = makeComponent(this, 'test-modal-2', ModalComponent, {
      layoutName: 'test-modal-2'
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, component1);

    return new Promise(resolve => {
      // Wait for document event listeners to be installed
      window.setTimeout(() => { resolve(); }, 50);
    }).then(() => {
      assert.ok(!!document.querySelector('[data-test-modal-1]'), 'renders modal 1');
      assert.ok(!document.querySelector('[data-test-modal-2]'), 'no render of modal 2');

      openModal(this, component2);
    }).then(() => {
      // Wait for an animation
      return waitUntil(() => document.querySelector('[data-test-modal-1]') === null);
    }).then(() => {
      assert.ok(!document.querySelector('[data-test-modal-1]'), 'no render of modal 1');
      assert.ok(!!document.querySelector('[data-test-modal-2]'), 'renders modal 2');
    })
  });
  
  test('it handles actions in a modal', function(assert) {
    let hasActionFired = false;
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
      actions: {
        fire() {
          hasActionFired = true;
        }
      }
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.notOk(
      hasActionFired,
      'precond - action has not fired'
    );
  
    $(document.querySelector('[data-test-fire-action]')).click();
  
    assert.ok(
      hasActionFired,
      'Action was fired'
    );
  });
  
  test('it handles actions in a modal\'s header/content/footer views', function(assert) {
    let actionsFired = {};
  
    let modalViewClasses = ['header','content','footer'];
  
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      headerViewClass: Ember.View.extend({ templateName: 'test-modal-header' }),
      contentViewClass: Ember.View.extend({ templateName: 'test-modal-content' }),
      footerViewClass: Ember.View.extend({ templateName: 'test-modal-footer' }),
      actions: {
        modalHeaderAction() {
          actionsFired.header = true;
        },
        modalFooterAction() {
          actionsFired.footer = true;
        },
        modalContentAction() {
          actionsFired.content = true;
        }
      }
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    modalViewClasses.forEach(name => {
      assert.ok($(`[data-test-modal-${name}-button]`).length > 0,
                  `renders modal ${name} view`);
    });
  
    assert.ok(
      !actionsFired.header && !actionsFired.content && !actionsFired.footer,
      'precond - no action has fired'
    );
  
    modalViewClasses.forEach(name => {
      $(document.querySelector(`[data-test-modal-${name}-button]`)).click();
      assert.ok(actionsFired[name], `${name} action fired`);
    });
  });

  test('it handles event delegation in a modal', function(assert) {
    let hasHandledClick = false;
  
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      layoutName: 'ember-widgets/-test-popover-content',
      click() {
        hasHandledClick = true;
      }
    });
  
    this.render(hbs`{{render-popover}}`);
  
    openModal(this, componentSpec);
  
    assert.notOk(
      hasHandledClick,
      'precond - click event had not been handled'
    );
  
    $(document.querySelector('[data-test-popover-content]')).click();
  
    assert.ok(
      hasHandledClick,
      'Click event handled'
    );
  });

  test('properties can be passed to the modal', function(assert) {
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
      footerText: 'foo',
      footerViewClass: Ember.View.extend({
        templateName: 'test-modal-footer'
      })
    })
    
    this.render(hbs`{{render-popover}}`);
    openModal(this, componentSpec);

    assert.ok(document.querySelector('[data-test-footer-text]'), 'footer text is rendered');
  });

  test('property bindings can be passed to the modal', function(assert) {
    let componentSpec = makeComponent(this, 'test-modal', ModalComponent);
    
    this.render(hbs`{{render-popover}}`);
    openModal(this, componentSpec, {
      fooBindingTest: true,
      fooBinding: 'bar',
      bar: 'baz',
      footerViewClass: Ember.View.extend({
        templateName: 'test-modal-footer'
      })
    });

    return wait().then(() => {
      assert.equal(document.querySelector('[data-test-footer-foo-value]').innerHTML, 'baz');
      assert.equal(document.querySelector('[data-test-footer-bar-value]').innerHTML, 'baz');
      debugger;
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz');
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz');

      Ember.run(() => fillIn('[data-test-footer-foo-input] input', 'baz-via-foo'));
      return wait();
    }).then(() => {
      assert.equal(document.querySelector('[data-test-footer-foo-value]').innerHTML, 'baz-via-foo');
      assert.equal(document.querySelector('[data-test-footer-bar-value]').innerHTML, 'baz-via-foo');
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz-via-foo');
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz-via-foo');

      Ember.run(() => fillIn('[data-test-footer-bar-input] input', 'baz-via-bar'));
      return wait();
    }).then(() => {
      assert.equal(document.querySelector('[data-test-footer-foo-value]').innerHTML, 'baz-via-bar');
      assert.equal(document.querySelector('[data-test-footer-bar-value]').innerHTML, 'baz-via-bar');
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz-via-bar');
      assert.equal(document.querySelector('[data-test-footer-bar-input] input').value, 'baz-via-bar');
    });
  });
  
  // The following tests fail when run through the old `ComponentClass.popup` method.
  // They should be skipped when run that way. They will only pass via the new API: `this.popoverService.openModal(...)`
  if (!skipDeprecatedAPIFailingTests) {
    test('it handles actions when footer disabled button state changes', function(assert) {
      let actionsFired = {};
    
      let componentSpec = makeComponent(this, 'test-modal', ModalComponent, {
        headerViewClass: Ember.View.extend({ templateName: 'test-modal-header' }),
        contentViewClass: Ember.View.extend({ templateName: 'test-modal-content' }),
        footerViewClass: Ember.View.extend({ templateName: 'test-modal-footer' }),
        footerText: null, // When present, this is rendered in the test-modal-footer
        actions: {
          modalHeaderAction() {
            actionsFired.header = true;
            this.set('footerText','Some footer text');
          },
          modalFooterAction() {
            actionsFired.footer = true;
          },
        }
      });
    
      this.render(hbs`{{render-popover}}`);
    
      openModal(this, componentSpec);
    
      return wait().then(() => {
        assert.ok(!actionsFired.header, 'precond - no header action');
        assert.ok(!document.querySelector('[data-test-footer-text]'), 'precond - no footer text');
    
        $(document.querySelector('[data-test-modal-header-button]')).click();
        return wait();
      }).then(() => {
    
        assert.ok(actionsFired.header, 'clicked header button');
        assert.ok(!!document.querySelector('[data-test-footer-text]'), 'shows footer text');
    
        $(document.querySelector('[data-test-modal-footer-button]')).click();
        return wait();
      }).then(() => {
        assert.ok(actionsFired.footer, 'fired footer action');
      })
    });  
  }
}