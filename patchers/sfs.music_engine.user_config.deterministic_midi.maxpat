{
    "patcher": {
        "fileversion": 1,
        "appversion": { "major": 8, "minor": 6, "revision": 0, "architecture": "x64", "modernui": 1 },
        "classnamespace": "box",
        "rect": [120.0, 120.0, 760.0, 320.0],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [15.0, 15.0],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 200,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 0.0,
        "description": "Layer C user configuration boundary for SFS_USER_CONFIG v0.1.0",
        "digest": "",
        "tags": "sfs,music-engine,user-config",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            { "box": { "id": "obj-1", "maxclass": "comment", "text": "Layer C User Configuration", "patching_rect": [35.0, 25.0, 260.0, 20.0] } },
            { "box": { "id": "obj-2", "maxclass": "comment", "text": "Send config <dict>, param <path> <value>, reset_to_defaults, or publish_config. Canonical defaults are loaded from data/music.", "linecount": 2, "patching_rect": [35.0, 50.0, 660.0, 36.0] } },
            { "box": { "id": "obj-3", "maxclass": "inlet", "comment": "configuration commands", "patching_rect": [65.0, 120.0, 30.0, 30.0] } },
            { "box": { "id": "obj-4", "maxclass": "newobj", "text": "js sfs.music_engine.core.deterministic_midi.js", "patching_rect": [65.0, 170.0, 260.0, 22.0] } },
            { "box": { "id": "obj-5", "maxclass": "outlet", "comment": "SFS_USER_CONFIG dictionary / diagnostics", "patching_rect": [65.0, 235.0, 30.0, 30.0] } }
        ],
        "lines": [
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-4", 0] } },
            { "patchline": { "source": ["obj-4", 5], "destination": ["obj-5", 0] } }
        ]
    }
}
