{
    "name":"OWL Purchase KPI Dashboard",
    "version":"1.0",
    "author":"Vishal Sharma",
    "depends":["web","sale","purchase"],
    "data":[
        "views/purchase_kpi_dashboard_action.xml",
    ],
    "assets":{
        "web.assets_backend":[
            "owl_purchase_kpi_dashboard/static/src/js/purchase_kpi_dashboard.js",
            "owl_purchase_kpi_dashboard/static/src/xml/purchase_kpi_dashboard.xml",
            
        ],
    },
    "installable": True,
    "application": True,
}