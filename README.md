<img src="http://i.imgur.com/7ddbE0q.gif" width="300">


VUS
=======

<a href="https://travis-ci.org/networked-aframe/networked-aframe"><img src="https://img.shields.io/travis/networked-aframe/networked-aframe.svg" alt="Build Status"></a>
<span class="badge-npmversion"><a href="https://npmjs.org/package/networked-aframe" title="View this project on NPM"><img src="https://img.shields.io/npm/v/networked-aframe.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/networked-aframe" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/networked-aframe.svg" alt="NPM downloads" /></a></span>

**Platform for Multi-User VR on the Web**

Platform for developers to upload their multi-user VR experiences.

We currently support AFRAME and NETWORKED-AFRAME VR experiences.

<div>
  <a href="#getting-started">Getting Started</a>
  &mdash;
  <a href="#more-examples">Examples</a>
  &mdash;
</div>

<br>

Getting Started
---------------

For networked-aframe: Follow [the NAF Getting Started tutorial](https://github.com/networked-aframe/networked-aframe/blob/master/docs/getting-started-local.md) to build your own example from scratch, including setting up a local server.

To upload your files, go to the add button on the platform. Include all of your files there.

#### MAKE SURE YOUR LINKS ARE RELATIVE, NOT ABSOLUTE

### Scene component

Required on the A-Frame `<a-scene>` component.

```html
<a-scene networked-scene="
  serverURL: /;
  app: <appId>;
  room: <roomName>;
  connectOnLoad: true;
  onConnect: onConnect;
  adapter: wseasyrtc;
  audio: false;
  debug: false;
">
  ...
</a-scene>
```

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| serverURL  | Choose where the WebSocket / signalling server is located. | / |
| app  | Unique app name. Spaces are not allowed. | default |
| room  | Unique room name. Can be multiple per app. Spaces are not allowed. There can be multiple rooms per app and clients can only connect to clients in the same app & room. | default |
| connectOnLoad  | Connect to the server as soon as the webpage loads. | true |
| onConnect  | Function to be called when client has successfully connected to the server. | onConnect |
| adapter | The network service that you wish to use, see [adapters](#adapters). | wseasyrtc |
| audio  | Turn on / off microphone audio streaming for your app. Only works if the chosen adapter supports it. | false |
| debug  | Turn on / off Networked-Aframe debug logs. | false |

### Connecting

By default, `networked-scene` will connect to your server automatically. To prevent this and instead have control over when to connect, set `connectOnLoad` to false in `networked-scene`. When you are ready to connect emit the `connect` event on the `a-scene` element.

```javascript
AFRAME.scenes[0].emit('connect');
```


### Creating Networked Entities

```html
<a-assets>
  <template id="my-template">
    <a-entity>
      <a-sphere color="#f00"></a-sphere>
    </a-entity>
  </template>
<a-assets>

<!-- Attach local template by default -->
<a-entity networked="template: #my-template">
</a-entity>

<!-- Do not attach local template -->
<a-entity networked="template:#my-template;attachTemplateToLocal:false">
</a-entity>
```

Create an instance of a template to be synced across clients. The position and rotation will be synced by default. The [`aframe-lerp-component`](https://github.com/haydenjameslee/aframe-lerp-component) is added to allow for less network updates while keeping smooth motion.

Templates must only have one root element. When `attachTemplateToLocal` is set to true, the attributes on this element will be copied to the local entity and the children will be appended to the local entity. Remotely instantiated entities will be a copy of the root element of the template with the `networked` component added to it.
