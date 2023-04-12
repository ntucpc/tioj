// Entry point for the build script in your package.json
import './helpers/jquery-global';
import 'jquery-ujs';
import {createPopper} from '@popperjs/core';

import 'bootstrap';
import 'bootstrap-select';
import './vendor/bootstrap-switch'

// flat UI
import './vendor/flatui-checkbox';
import './vendor/flatui-radio';
import './helpers/flatui';

import './vendor/jquery.tagsinput';
import 'jquery-placeholder';
import './vendor/jquery_nested_form';

// tablesorter
import 'tablesorter/dist/js/jquery.tablesorter';
import 'tablesorter/dist/js/extras/jquery.tablesorter.pager.min';
import './vendor/pager-custom-controls';

// file upload
import 'blueimp-file-upload';
import 'blueimp-tmpl';

// pages
import './pages/posts';
import './pages/problems';
import './pages/submissions';
import './pages/users';

// helpers
import './helpers/init_code_copy_script'
import { buttonCheckboxSetup } from './helpers/button_checkbox_setup'
import { contestDashboardRefresh } from './helpers/contest_dashboard_refresh'
window.buttonCheckboxSetup = buttonCheckboxSetup
window.contestDashboardRefresh = contestDashboardRefresh