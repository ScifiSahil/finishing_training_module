# -*- mode: python; coding: utf-8 -*-
#
# Copyright (C) 1990 - 2016 CONTACT Software GmbH
# All rights reserved.
# http://www.contact.de/

__docformat__ = "restructuredtext en"
__revision__ = "$Id: main.py 142800 2016-06-17 12:53:51Z js $"

import os

from cdb import rte
from cdb import sig

from cs.platform.web import static
from cs.platform.web.root import Root

from cs.web.components.base.main import BaseApp
from cs.web.components.base.main import BaseModel


class Finishing_training_moduleApp(BaseApp):
    pass


@Root.mount(app=Finishing_training_moduleApp, path="/kalyani.iot/finishing_training_module")
def _mount_app():
    return Finishing_training_moduleApp()


@Finishing_training_moduleApp.view(model=BaseModel, name="document_title", internal=True)
def default_document_title(self, request):
    return "Finishing_training_module"


@Finishing_training_moduleApp.view(model=BaseModel, name="app_component", internal=True)
def _setup(self, request):
    request.app.include("kalyani-iot-finishing_training_module", "0.0.1")
    return "kalyani-iot-finishing_training_module-MainComponent"


@Finishing_training_moduleApp.view(model=BaseModel, name="base_path", internal=True)
def get_base_path(self, request):
    return request.path


@sig.connect(rte.APPLICATIONS_LOADED_HOOK)
def _register_libraries():
    lib = static.Library("kalyani-iot-finishing_training_module", "0.0.1",
                         os.path.join(os.path.dirname(__file__), 'js', 'build'))
    lib.add_file("kalyani-iot-finishing_training_module.js")
    lib.add_file("kalyani-iot-finishing_training_module.js.map")
    static.Registry().add(lib)
