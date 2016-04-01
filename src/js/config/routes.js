import React from 'react';

import App from '../components/app';

import Dashboard from '../components/dashboard/dashboard';
import Updates from '../components/updates/updates';
import Devices from '../components/devices/devices';
import Software from '../components/software/software';


import { Router, Route, IndexRoute } from 'react-router';


module.exports = (
  <Route path="/" component={App}>
    <IndexRoute component={Dashboard} />
    <Route path="/devices" component={Devices} >
      <Route path="(:groupId)">
        <Route path="(:filters)" />
      </Route>
    </Route>
    <Route path="/software" component={Software}>
      <Route path="(:softwareVersion)" />
    </Route>
    <Route path="/updates" component={Updates}>
      <Route path="(:tab)">
        <Route path="(:params)">
          <Route path="(:Id)" />
        </Route>
      </Route>
    </Route>
  </Route>
);  