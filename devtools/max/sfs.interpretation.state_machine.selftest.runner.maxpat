{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 6,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [120.0, 120.0, 800.0, 430.0],
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
        "description": "Automated self-test runner for Layer B state-machine interpretation",
        "digest": "",
        "tags": "sfs,test,interpretation,state-machine",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer B Automated Self-Test Runner",
                    "patching_rect": [35.0, 25.0, 300.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Runs fixture sequences through the production Layer B interpretation JS and writes logs/tests/layer_b_selftest.latest.json.",
                    "linecount": 2,
                    "patching_rect": [35.0, 50.0, 690.0, 36.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [35.0, 115.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [35.0, 155.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "newobj",
                    "text": "js sfs.interpretation.state_machine.selftest_driver.js",
                    "patching_rect": [170.0, 155.0, 360.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.interpretation.state_machine.js",
                    "patching_rect": [170.0, 225.0, 455.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "text": "print sfs.layer_b.selftest",
                    "patching_rect": [550.0, 155.0, 175.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "comment",
                    "text": "Report: logs/tests/layer_b_selftest.latest.json",
                    "patching_rect": [35.0, 320.0, 340.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "comment",
                    "text": "Append log: logs/tests/layer_b_selftest.jsonl",
                    "patching_rect": [35.0, 345.0, 320.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "newobj",
                    "text": "delay 3000",
                    "patching_rect": [35.0, 205.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "message",
                    "text": "write \"D:/tmp/sfs_project/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [35.0, 245.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [35.0, 285.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "comment",
                    "text": "Auto-exports Max Console after self-test load.",
                    "patching_rect": [105.0, 285.0, 280.0, 20.0]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-4", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-10", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-4", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 0],
                    "destination": ["obj-6", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 1],
                    "destination": ["obj-7", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-5", 1]
                }
            },
            {
                "patchline": {
                    "source": ["obj-10", 0],
                    "destination": ["obj-11", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-12", 0]
                }
            }
        ]
    }
}
