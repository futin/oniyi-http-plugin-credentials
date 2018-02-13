// node core modules

// 3rd party modules
import test from 'ava';

// internal modules
import factory from '../lib';
import user from './fixtures/user';

test.cb('default options remove user prop from request params', (t) => {
  const options = { providerName: 'oauth' };
  const plugin = factory(options);
  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.ifError(err);

    t.false(Object.prototype.hasOwnProperty.call(ctx.options, 'user'));
    t.end();
  });
});

test.cb('preserves user prop from request params with falsy removeUserProp in options', (t) => {
  const options = { providerName: 'oauth', removeUserProp: false };
  const plugin = factory(options);

  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.ifError(err);
    t.true(Object.prototype.hasOwnProperty.call(ctx.options, 'user'));
    t.deepEqual(ctx.options.user, user);
    t.end();
  });
});

test.cb('noop when no "user" in request params', (t) => {
  const options = { providerName: 'oauth' };
  const plugin = factory(options);
  const ctxOptions = {};
  const ctx = { options: ctxOptions };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.ifError(err);
    t.is(ctx.options, ctxOptions);
    t.end();
  });
});

test.cb('noop when phase hook handler is marked for skipping', (t) => {
  const options = { providerName: 'oauth' };
  const plugin = factory(options);
  const ctxOptions = {
    phasesToSkip: {
      requestPhases: ['credentials'],
    }
  };
  const ctx = { options: ctxOptions };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.ifError(err);
    t.is(ctx.options, ctxOptions);
    t.end();
  });
});

test.cb('fails when "user.credentialsMethodName" is not a function', (t) => {
  const options = { providerName: 'oauth', credentialsMethodName: 'does-not-exist' };
  const plugin = factory(options);
  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.is(err.message, `user.${options.credentialsMethodName} must be a function`);
    t.end();
  });
});

test.cb('fails when "user.credentialsMethodName()" produces an error', (t) => {
  const options = { providerName: 'oauth', credentialsMethodName: 'getCredentialsWithError' };
  const plugin = factory(options);
  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.is(err.message, 'credentials error');
    t.end();
  });
});

test.cb('fails when "user.credentialsMethodName()" produces falsy "credentials" argument', (t) => {
  const options = { providerName: 'falsy' };
  const plugin = factory(options);
  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.true(err.message.startsWith('No credentials found for user'));
    t.end();
  });
});

test.cb('fails when "user.credentialsMethodName()" produces "credentials" argument with undefined "payload"', (t) => {
  const options = { providerName: 'no-payload' };
  const plugin = factory(options);
  const ctx = { options: { user } };
  const requestPhaseHookHandler = plugin.onRequest[0];

  requestPhaseHookHandler.handler(ctx, (err) => {
    t.is(err.message, 'payload must not be undefined');
    t.end();
  });
});
