/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class PurchaseKPIDashboard extends Component {

    setup() {

        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            customers: [],
            selectedCustomer: null,

            totalPO: 0,
            draftPO: 0,
            totalsent:0,
            confirmPO: 0,
            totaldone:0,
            cancelPO: 0,
        });

        this.loadCustomers();
        this.loadKPI();
        this.loadChartData();

    }


    async loadCustomers() {

        this.state.customers = await this.orm.searchRead(
            "res.partner",
            [],
            ["name"]
        );
    }


    async loadKPI() {

        let domain = [];

        if (this.state.selectedCustomer) {
            domain.push(["partner_id", "=", this.state.selectedCustomer]);
        }

        const total = await this.orm.searchCount(
            "purchase.order",
            domain
        );

        const draft = await this.orm.searchCount(
            "purchase.order",
            [...domain, ["state", "=", "draft"]]
        );

        const confirm = await this.orm.searchCount(
            "purchase.order",
            [...domain, ["state", "=", "purchase"]]
        );

        const cancel = await this.orm.searchCount(
            "purchase.order",
            [...domain, ["state", "=", "cancel"]]
        );
        const sent = await this.orm.searchCount(
            "purchase.order",
            [...domain ,["state","=","sent"]]
        );
        const done = await this.orm.searchCount(
            "purchase.order",
            [...domain , ["state","=","done"]]
        );
        this.state.totalPO = total;
        this.state.draftPO = draft;
        this.state.confirmPO = confirm;
        this.state.cancelPO = cancel;
        this.state.totalsent = sent;
        this.state.totaldone = done;
    }
    async loadChartData() {

        let domain = [];

        if (this.state.selectedCustomer) {
            domain.push(["partner_id","=",this.state.selectedCustomer]);
        }

        const result = await this.orm.readGroup(
            "purchase.order",
            domain,
            ["amount_total:sum","id:count"],
            ["state"]
        );

        this.renderPieChart(result);
    }

    async onCustomerChange(ev) {

        const value = ev.target.value;
        this.state.selectedCustomer = value ? parseInt(value) : null;

        await this.loadKPI();
        this.loadChartData();

    }

    renderPieChart(data) {

        const labels = [];
        const values = [];

        data.forEach(item => {

            labels.push(item.state + " (" + item.state_count + ")");

            values.push(item.amount_total);

        });

        const ctx = document.getElementById("poPieChart");

        if (this.pieChart) {
            this.pieChart.destroy();
        }

        this.pieChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values
                }]
            }
        });  

        const barchart = document.getElementById("poBarChart");

        if (this.barchart) {
            this.barchart.destroy();
        }

        this.barchart = new Chart(barchart, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    data: values
                }]
            }
        });

    }

    openPO(domainExtra = []) {

        let domain = [...domainExtra];

        if (this.state.selectedCustomer) {
            domain.push(["partner_id", "=", this.state.selectedCustomer]);
        }

        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Purchase Orders",
            res_model: "purchase.order",
            views: [[false, "list"], [false, "form"]],
            domain: domain,
        });
    }

    openTotal() {
        this.openPO([]);
    }

    openDraft() {
        this.openPO([["state", "=", "draft"]]);
    }

    openConfirm() {
        this.openPO([["state", "=", "purchase"]]);
    }

    openCancel() {
        this.openPO([["state", "=", "cancel"]]);
    }
    openSent(){
        this.openPO([["state","=","sent"]]);
    }
    openDone(){
        this.openPO([["state","=","done"]]);
    }
}

PurchaseKPIDashboard.template = "owl_purchase_kpi_dashboard.Dashboard";

registry.category("actions").add("purchase_kpi_dashboard_action",PurchaseKPIDashboard);